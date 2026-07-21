import { useState, useEffect } from "react";
import { type Colors, mono } from "../../theme";

interface NavBarProps {
    c: Colors;
    theme: "dark" | "light";
    onToggleTheme: () => void;
    onOpenContact: () => void;
}

const NAV_LINKS = [
    { id: "projects", label: "Projects" },
    { id: "stats",    label: "Stats"    },
    { id: "papers",   label: "Papers"   },
    { id: "about",    label: "About"    },
] as const;

const NavBar = ({ c, theme, onToggleTheme, onOpenContact }: NavBarProps) => {
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const ids = ["hero", "projects", "stats", "papers", "about"];
        const observer = new IntersectionObserver(
            (entries) => {
                // The last intersecting entry closest to the top wins
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) setActiveId(visible[0].target.id);
            },
            { threshold: 0.25 },
        );
        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    return (
        <nav
            className="portfolio-nav"
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 56px",
                background: c.navBg,
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                borderBottom: `1px solid ${c.border}`,
            }}
        >
            <div style={{ fontFamily: mono, fontSize: "14px", letterSpacing: "2px", color: c.accent, fontWeight: 600 }}>
                FTeles
            </div>

            <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                {NAV_LINKS.map(({ id, label }) => {
                    const isActive = activeId === id;
                    return (
                        <a
                            key={id}
                            href={`#${id}`}
                            style={{
                                position: "relative",
                                fontFamily: mono,
                                fontSize: "11px",
                                letterSpacing: "1.5px",
                                color: isActive ? c.accent : c.muted,
                                textDecoration: "none",
                                textTransform: "uppercase",
                                transition: "color .2s",
                            }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = c.accent)}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = isActive ? c.accent : c.muted)}
                        >
                            {label}
                            {/* Active dot indicator */}
                            <span
                                style={{
                                    position: "absolute",
                                    bottom: "-6px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    width: "3px",
                                    height: "3px",
                                    borderRadius: "50%",
                                    background: c.accent,
                                    opacity: isActive ? 1 : 0,
                                    transition: "opacity .25s",
                                }}
                            />
                        </a>
                    );
                })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                    className="theme-toggle"
                    onClick={onToggleTheme}
                    style={{ fontFamily: mono, fontSize: "11px", letterSpacing: "1px", color: c.muted, background: "none", border: `1px solid ${c.border}`, padding: "7px 14px", borderRadius: "2px", transition: "color .2s, border-color .2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = c.text; (e.currentTarget as HTMLElement).style.borderColor = c.text; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = c.muted; (e.currentTarget as HTMLElement).style.borderColor = c.border; }}
                >
                    {theme === "dark" ? "☀ Light" : "☾ Dark"}
                </button>
                <button
                    onClick={onOpenContact}
                    style={{ fontFamily: mono, fontSize: "12px", letterSpacing: "0.6px", color: c.bg, background: c.accent, padding: "10px 20px", borderRadius: "2px", fontWeight: 600, border: "none", whiteSpace: "nowrap", transition: "opacity .2s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.82")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                >
                    Contact Me
                </button>
            </div>
        </nav>
    );
};

export default NavBar;
