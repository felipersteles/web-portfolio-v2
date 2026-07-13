import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const GITHUB_USER = "felipersteles";

type Repo = {
    id: number;
    name: string;
    language: string | null;
    created_at: string;
    pushed_at: string;
    stargazers_count: number;
    forks_count: number;
    html_url: string;
    description: string | null;
};

type GithubUser = {
    login: string;
    name: string;
    avatar_url: string;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
    html_url: string;
    created_at: string;
};

type GithubEvent = {
    type: string;
    created_at: string;
    repo: { name: string };
};

type LanguageStat = {
    name: string;
    repoCount: number;
    firstUsed: string;
    lastUsed: string;
};

const LANG_COLORS: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f7df1e",
    Python: "#3572a5",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Rust: "#dea584",
    Go: "#00add8",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    Shell: "#89e051",
    Kotlin: "#f18e33",
    Swift: "#f05138",
    Ruby: "#701516",
    PHP: "#4f5d95",
    Dart: "#00b4ab",
    Vue: "#41b883",
    "Jupyter Notebook": "#da5b0b",
};

const getLangColor = (lang: string) => LANG_COLORS[lang] ?? "#8e8e8e";

const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
    return `${Math.floor(diff / 31536000)}y ago`;
};

const yearsExp = (dateStr: string) => {
    const years = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (years < 1) return "< 1 yr";
    return `${Math.floor(years)} yr${Math.floor(years) !== 1 ? "s" : ""}`;
};

const toDay = (dateStr: string) => new Date(dateStr).toISOString().split("T")[0];

const computeStreak = (events: GithubEvent[]) => {
    const pushDays = [...new Set(
        events.filter(e => e.type === "PushEvent").map(e => toDay(e.created_at))
    )].sort().reverse();

    if (pushDays.length === 0) return { current: 0, longest: 0 };

    const today = toDay(new Date().toISOString());
    const yesterday = toDay(new Date(Date.now() - 86400000).toISOString());

    let current = 0;
    if (pushDays[0] === today || pushDays[0] === yesterday) {
        let expected = pushDays[0];
        for (const day of pushDays) {
            if (day === expected) {
                current++;
                const d = new Date(expected);
                d.setDate(d.getDate() - 1);
                expected = toDay(d.toISOString());
            } else break;
        }
    }

    let longest = 1;
    let streak = 1;
    for (let i = 1; i < pushDays.length; i++) {
        const diff = Math.round(
            (new Date(pushDays[i - 1]).getTime() - new Date(pushDays[i]).getTime()) / 86400000
        );
        streak = diff === 1 ? streak + 1 : 1;
        if (streak > longest) longest = streak;
    }

    return { current, longest: Math.max(longest, current) };
};

const StatsPage = () => {
    const [user, setUser] = useState<GithubUser | null>(null);
    const [repos, setRepos] = useState<Repo[]>([]);
    const [events, setEvents] = useState<GithubEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [langSearch, setLangSearch] = useState("");
    const [repoLangFilter, setRepoLangFilter] = useState("all");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, reposRes, eventsRes] = await Promise.all([
                    fetch(`https://api.github.com/users/${GITHUB_USER}`),
                    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=created&direction=asc`),
                    fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=100`),
                ]);
                if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API error");
                setUser(await userRes.json());
                setRepos(await reposRes.json());
                if (eventsRes.ok) setEvents(await eventsRes.json());
            } catch {
                setError("Failed to load GitHub data. You may have hit the API rate limit.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const languageStats: LanguageStat[] = useMemo(() => {
        const map: Record<string, { count: number; firstUsed: string; lastUsed: string }> = {};
        for (const repo of repos) {
            if (!repo.language) continue;
            const lang = repo.language;
            if (!map[lang]) map[lang] = { count: 0, firstUsed: repo.created_at, lastUsed: repo.pushed_at };
            map[lang].count++;
            if (new Date(repo.created_at) < new Date(map[lang].firstUsed)) map[lang].firstUsed = repo.created_at;
            if (new Date(repo.pushed_at) > new Date(map[lang].lastUsed)) map[lang].lastUsed = repo.pushed_at;
        }
        return Object.entries(map)
            .map(([name, d]) => ({ name, repoCount: d.count, firstUsed: d.firstUsed, lastUsed: d.lastUsed }))
            .sort((a, b) => b.repoCount - a.repoCount);
    }, [repos]);

    const lastPushed = useMemo(
        () => repos.length ? [...repos].sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())[0] : null,
        [repos]
    );

    const oldestRepo = useMemo(
        () => repos.length ? repos[0] : null,
        [repos]
    );

    const totalStars = useMemo(() => repos.reduce((s, r) => s + r.stargazers_count, 0), [repos]);
    const streak = useMemo(() => computeStreak(events), [events]);

    const filteredLangs = useMemo(
        () => languageStats.filter(l => langSearch === "" || l.name.toLowerCase().includes(langSearch.toLowerCase())),
        [languageStats, langSearch]
    );

    const filteredRepos = useMemo(
        () => [...repos]
            .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
            .filter(r => repoLangFilter === "all" || r.language === repoLangFilter)
            .slice(0, 20),
        [repos, repoLangFilter]
    );

    const allLanguages = useMemo(() => languageStats.map(l => l.name), [languageStats]);
    const maxRepoCount = languageStats[0]?.repoCount || 1;

    if (loading) return (
        <div className="relative z-[5] w-full h-screen flex items-center justify-center">
            <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-body/80 text-lg"
            >
                Loading GitHub stats...
            </motion.div>
        </div>
    );

    if (error) return (
        <div className="relative z-[5] w-full h-screen flex items-center justify-center">
            <div className="bg-text/80 backdrop-blur-md rounded-2xl p-8 text-body/80 text-center max-w-sm border border-body/20">
                <div className="text-red-400 mb-2 font-semibold">Oops</div>
                <div className="text-sm">{error}</div>
            </div>
        </div>
    );

    return (
        <motion.div
            className="relative z-[5] w-full h-screen flex items-start justify-center pt-24 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="w-full max-w-6xl h-full overflow-y-auto pb-12 px-4 space-y-5">

                {/* Profile header */}
                {user && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-text/85 backdrop-blur-md rounded-[0_30px_0_30px] p-5 flex flex-wrap items-center gap-5 border border-body/20 shadow-lg"
                    >
                        <img src={user.avatar_url} alt={user.name} className="w-16 h-16 rounded-full border-2 border-body/30 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-body">{user.name}</h1>
                            {user.bio && <p className="text-body/60 text-sm mt-0.5 truncate">{user.bio}</p>}
                            <a href={user.html_url} target="_blank" rel="noreferrer" className="text-accent text-xs hover:underline cursor-pointer">
                                @{user.login}
                            </a>
                        </div>
                        <div className="flex gap-6 text-body shrink-0">
                            {[
                                { label: "followers", value: user.followers },
                                { label: "repos", value: user.public_repos },
                                { label: "stars", value: totalStars },
                            ].map(({ label, value }) => (
                                <div key={label} className="text-center">
                                    <div className="text-2xl font-bold">{value}</div>
                                    <div className="text-xs text-body/50">{label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Key metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Languages", value: allLanguages.length },
                        { label: "Last commit", value: lastPushed ? timeAgo(lastPushed.pushed_at) : "—" },
                        { label: "Last language", value: lastPushed?.language ?? "—" },
                        { label: "Most used", value: languageStats[0]?.name ?? "—" },
                        { label: "Current streak", value: streak.current > 0 ? `${streak.current} day${streak.current !== 1 ? "s" : ""}` : "—" },
                        { label: "On GitHub since", value: user ? new Date(user.created_at).getFullYear().toString() : "—" },
                    ].map(({ label, value }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="bg-text/85 backdrop-blur-md rounded-2xl p-4 border border-body/20 text-center shadow"
                        >
                            <div className="text-xl font-bold text-body">{value}</div>
                            <div className="text-xs text-body/50 mt-1">{label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Highlights: account age + oldest repo + longest streak */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Account age */}
                    {user && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.22 }}
                            className="bg-text/85 backdrop-blur-md rounded-[0_20px_0_20px] border border-body/20 p-5 shadow flex flex-col gap-2"
                        >
                            <div className="text-body/50 text-xs uppercase tracking-wider">Account age</div>
                            <div className="text-3xl font-bold text-body">{yearsExp(user.created_at)}</div>
                            <div className="text-body/50 text-xs">
                                Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </div>
                        </motion.div>
                    )}

                    {/* Oldest repo */}
                    {oldestRepo && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.28 }}
                            className="bg-text/85 backdrop-blur-md rounded-[0_20px_0_20px] border border-body/20 p-5 shadow flex flex-col gap-2"
                        >
                            <div className="text-body/50 text-xs uppercase tracking-wider">Oldest repo</div>
                            <a
                                href={oldestRepo.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-lg font-bold text-body hover:text-accent transition-colors truncate cursor-pointer"
                            >
                                {oldestRepo.name}
                            </a>
                            <div className="flex items-center gap-2">
                                {oldestRepo.language && (
                                    <span className="flex items-center gap-1.5 text-xs text-body/60">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLangColor(oldestRepo.language) }} />
                                        {oldestRepo.language}
                                    </span>
                                )}
                                <span className="text-body/40 text-xs">
                                    · {new Date(oldestRepo.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {/* Longest streak */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.34 }}
                        className="bg-text/85 backdrop-blur-md rounded-[0_20px_0_20px] border border-body/20 p-5 shadow flex flex-col gap-2"
                    >
                        <div className="text-body/50 text-xs uppercase tracking-wider">Longest streak</div>
                        <div className="text-3xl font-bold text-body">
                            {streak.longest > 0 ? `${streak.longest} day${streak.longest !== 1 ? "s" : ""}` : "—"}
                        </div>
                        <div className="text-body/40 text-xs">from last 100 public events</div>
                    </motion.div>
                </div>

                {/* Languages bar chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 }}
                    className="bg-text/85 backdrop-blur-md rounded-[0_30px_0_30px] border border-body/20 overflow-hidden shadow"
                >
                    <div className="p-4 border-b border-body/15 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                        <h2 className="text-body font-bold text-base">Languages</h2>
                        <input
                            type="text"
                            placeholder="Search language..."
                            value={langSearch}
                            onChange={e => setLangSearch(e.target.value)}
                            className="bg-body/10 text-body placeholder-body/40 text-sm border border-body/20 rounded-lg px-3 py-1.5 outline-none focus:border-body/50 w-full sm:w-52 cursor-text"
                        />
                    </div>
                    <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                        {filteredLangs.map(lang => (
                            <div key={lang.name} className="flex items-center gap-3">
                                <div className="w-24 text-body/80 text-sm shrink-0 truncate">{lang.name}</div>
                                <div className="flex-1 bg-body/10 rounded-full h-1.5">
                                    <motion.div
                                        className="h-1.5 rounded-full"
                                        style={{ backgroundColor: getLangColor(lang.name) }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.round((lang.repoCount / maxRepoCount) * 100)}%` }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                    />
                                </div>
                                <div className="text-body/50 text-xs w-14 text-right shrink-0">{lang.repoCount} repos</div>
                                <div className="text-body/35 text-xs w-36 text-right shrink-0 hidden md:block">
                                    {yearsExp(lang.firstUsed)} · last {timeAgo(lang.lastUsed)}
                                </div>
                            </div>
                        ))}
                        {filteredLangs.length === 0 && (
                            <p className="text-body/40 text-sm text-center py-4">No languages found.</p>
                        )}
                    </div>
                </motion.div>

                {/* Experience cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.44 }}
                    className="bg-text/85 backdrop-blur-md rounded-[0_30px_0_30px] border border-body/20 overflow-hidden shadow"
                >
                    <div className="p-4 border-b border-body/15">
                        <h2 className="text-body font-bold text-base">Experience Timeline</h2>
                    </div>
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {languageStats.map((lang, i) => (
                            <motion.div
                                key={lang.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04 }}
                                className="bg-body/10 rounded-xl p-3 flex flex-col gap-1 border border-body/10"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getLangColor(lang.name) }} />
                                    <span className="text-body font-semibold text-sm truncate">{lang.name}</span>
                                </div>
                                <div className="text-body/60 text-xs">{yearsExp(lang.firstUsed)} experience</div>
                                <div className="text-body/35 text-xs">since {new Date(lang.firstUsed).getFullYear()}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent activity table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-text/85 backdrop-blur-md rounded-[0_30px_0_30px] border border-body/20 overflow-hidden shadow"
                >
                    <div className="p-4 border-b border-body/15 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                        <h2 className="text-body font-bold text-base">Recent Activity</h2>
                        <select
                            value={repoLangFilter}
                            onChange={e => setRepoLangFilter(e.target.value)}
                            className="bg-body/10 text-body text-sm border border-body/20 rounded-lg px-3 py-1.5 outline-none focus:border-body/50 w-full sm:w-52 cursor-pointer"
                        >
                            <option value="all">All languages</option>
                            {allLanguages.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-body/10 text-body/40 text-xs uppercase tracking-wide">
                                    <th className="text-left p-3 font-normal">Repository</th>
                                    <th className="text-left p-3 font-normal">Language</th>
                                    <th className="text-left p-3 font-normal">Last push</th>
                                    <th className="text-left p-3 font-normal hidden sm:table-cell">Stars</th>
                                    <th className="text-left p-3 font-normal hidden lg:table-cell">Forks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRepos.map((repo, i) => (
                                    <motion.tr
                                        key={repo.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.025 }}
                                        className="border-b border-body/10 hover:bg-body/5 transition-colors"
                                    >
                                        <td className="p-3">
                                            <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-body hover:text-accent transition-colors font-medium cursor-pointer">
                                                {repo.name}
                                            </a>
                                            {repo.description && (
                                                <div className="text-body/35 text-xs mt-0.5 truncate max-w-[180px]">{repo.description}</div>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {repo.language ? (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getLangColor(repo.language) }} />
                                                    <span className="text-body/70">{repo.language}</span>
                                                </span>
                                            ) : (
                                                <span className="text-body/25">—</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-body/55 whitespace-nowrap">{timeAgo(repo.pushed_at)}</td>
                                        <td className="p-3 text-body/55 hidden sm:table-cell">&#9733; {repo.stargazers_count}</td>
                                        <td className="p-3 text-body/55 hidden lg:table-cell">{repo.forks_count}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredRepos.length === 0 && (
                            <p className="text-body/40 text-sm text-center py-6">No repositories found.</p>
                        )}
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
};

export default StatsPage;
