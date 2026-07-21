import { useState, useEffect, useMemo } from "react";
import { type Colors, mono, serif } from "../../theme";

const GITHUB_USER = "felipersteles";

type Repo = {
    id: number; name: string; language: string | null;
    pushed_at: string; created_at: string;
    stargazers_count: number; forks_count: number;
    html_url: string; description: string | null;
};
type GithubUser = {
    login: string; name: string; avatar_url: string; bio: string | null;
    public_repos: number; followers: number; html_url: string; created_at: string;
};
type GithubEvent = { type: string; created_at: string };

const timeAgo = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (diff < 3600) return Math.max(1, Math.floor(diff / 60)) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    if (diff < 2592000) return Math.floor(diff / 86400) + "d ago";
    if (diff < 31536000) return Math.floor(diff / 2592000) + "mo ago";
    return Math.floor(diff / 31536000) + "y ago";
};

const toDay = (d: string) => new Date(d).toISOString().split("T")[0];

const computeStreak = (events: GithubEvent[]) => {
    const days = [...new Set(events.filter((e) => e.type === "PushEvent").map((e) => toDay(e.created_at)))].sort().reverse();
    if (!days.length) return { current: 0, longest: 0 };
    const today = toDay(new Date().toISOString());
    const yesterday = toDay(new Date(Date.now() - 86400000).toISOString());
    let cur = 0;
    if (days[0] === today || days[0] === yesterday) {
        let exp = days[0];
        for (const day of days) {
            if (day === exp) { cur++; const dt = new Date(exp); dt.setDate(dt.getDate() - 1); exp = toDay(dt.toISOString()); }
            else break;
        }
    }
    let longest = 1, streak = 1;
    for (let i = 1; i < days.length; i++) {
        const diff = Math.round((new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / 86400000);
        streak = diff === 1 ? streak + 1 : 1;
        if (streak > longest) longest = streak;
    }
    return { current: cur, longest: Math.max(longest, cur) };
};

const StatsSectionInner = ({ c, user, repos, events }: { c: Colors; user: GithubUser; repos: Repo[]; events: GithubEvent[] }) => {
    const languageStats = useMemo(() => {
        const map: Record<string, { count: number }> = {};
        for (const repo of repos) {
            if (!repo.language) continue;
            map[repo.language] = { count: (map[repo.language]?.count ?? 0) + 1 };
        }
        return Object.entries(map).map(([name, d]) => ({ name, count: d.count })).sort((a, b) => b.count - a.count);
    }, [repos]);

    const totalStars = useMemo(() => repos.reduce((s, r) => s + r.stargazers_count, 0), [repos]);
    const streak = useMemo(() => computeStreak(events), [events]);
    const lastPushed = useMemo(() => repos.length ? [...repos].sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())[0] : null, [repos]);
    const maxLangCount = languageStats[0]?.count || 1;

    const metrics = [
        { v: languageStats.length,                                           l: "languages"      },
        { v: lastPushed ? timeAgo(lastPushed.pushed_at) : "—",              l: "last commit"    },
        { v: languageStats[0]?.name ?? "—",                                 l: "most used"      },
        { v: streak.current > 0 ? `${streak.current}d` : "—",              l: "current streak" },
        { v: new Date(user.created_at).getFullYear(),                       l: "on GitHub since"},
        { v: streak.longest > 0 ? `${streak.longest}d` : "—",             l: "longest streak" },
    ];

    return (
        <>
            {/* Profile card */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap", background: c.surface, border: `1px solid ${c.border}`, borderRadius: "4px", padding: "28px", marginBottom: "24px" }}>
                <img src={user.avatar_url} alt={user.name} style={{ width: "72px", height: "72px", borderRadius: "50%", border: `2px solid ${c.accent}`, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontSize: "20px", fontWeight: 600 }}>{user.name}</div>
                    {user.bio && <div style={{ fontSize: "14px", color: c.muted, marginTop: "4px" }}>{user.bio}</div>}
                    <a href={user.html_url} target="_blank" rel="noreferrer" style={{ fontFamily: mono, fontSize: "12px", color: c.accent, textDecoration: "none" }}>@{user.login}</a>
                </div>
                <div className="stats-counters" style={{ display: "flex", gap: "36px", fontFamily: mono, textAlign: "center", flexShrink: 0 }}>
                    {[{ v: user.followers, l: "followers" }, { v: user.public_repos, l: "repos" }, { v: totalStars, l: "stars" }].map(({ v, l }) => (
                        <div key={l}>
                            <div style={{ fontSize: "24px", fontWeight: 600 }}>{v}</div>
                            <div style={{ fontSize: "11px", color: c.muted }}>{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Metrics grid */}
            <div className="stats-metrics-grid" style={{ marginBottom: "24px" }}>
                {metrics.map(({ v, l }) => (
                    <div key={l} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: "4px", padding: "20px", textAlign: "center" }}>
                        <div style={{ fontSize: "22px", fontWeight: 700 }}>{v}</div>
                        <div style={{ fontFamily: mono, fontSize: "11px", color: c.muted, marginTop: "6px" }}>{l}</div>
                    </div>
                ))}
            </div>

            {/* Language bars */}
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: "4px", padding: "26px" }}>
                <div style={{ fontWeight: 600, marginBottom: "18px" }}>Languages</div>
                {languageStats.slice(0, 10).map((lang) => (
                    <div key={lang.name} style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
                        <div style={{ width: "110px", fontFamily: mono, fontSize: "12px", color: c.muted, flexShrink: 0 }}>{lang.name}</div>
                        <div style={{ flex: 1, background: c.border, borderRadius: "20px", height: "6px", minWidth: 0 }}>
                            <div style={{ height: "6px", borderRadius: "20px", background: c.accent, width: `${Math.round((lang.count / maxLangCount) * 100)}%`, transition: "width .6s ease" }} />
                        </div>
                        <div style={{ fontFamily: mono, fontSize: "11px", color: c.muted, width: "60px", textAlign: "right", flexShrink: 0 }}>{lang.count} repos</div>
                    </div>
                ))}
            </div>
        </>
    );
};

interface StatsSectionProps { c: Colors }

const StatsSection = ({ c }: StatsSectionProps) => {
    const [user, setUser] = useState<GithubUser | null>(null);
    const [repos, setRepos] = useState<Repo[]>([]);
    const [events, setEvents] = useState<GithubEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const [u, r, e] = await Promise.all([
                    fetch(`https://api.github.com/users/${GITHUB_USER}`).then((res) => res.ok ? res.json() : Promise.reject()),
                    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=created&direction=asc`).then((res) => res.ok ? res.json() : []),
                    fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=100`).then((res) => res.ok ? res.json() : []).catch(() => []),
                ]);
                setUser(u);
                setRepos(Array.isArray(r) ? r : []);
                setEvents(Array.isArray(e) ? e : []);
            } catch {
                setError("Couldn't load GitHub data right now.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <section id="stats" style={{ padding: "120px 56px", background: c.surfaceAlt }}>
            <div style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "2px", color: c.accent, marginBottom: "14px" }}>GITHUB</div>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 44px", fontWeight: 700 }}>Live Stats</h2>

            {loading && <div style={{ fontFamily: mono, color: c.muted, animation: "pulse 1.6s infinite" }}>Loading GitHub data…</div>}
            {error   && <div style={{ fontFamily: mono, color: c.muted, fontSize: "14px" }}>{error}</div>}
            {!loading && !error && user && <StatsSectionInner c={c} user={user} repos={repos} events={events} />}
        </section>
    );
};

export default StatsSection;
