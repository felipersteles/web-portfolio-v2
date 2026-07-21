import { type Colors, mono } from "../../theme";

interface NavBarProps {
    c: Colors;
    theme: "dark" | "light";
    onToggleTheme: () => void;
    onOpenContact: () => void;
}

const NAV_LINKS = [
    { id: "projects", label: "Projects" },
    { id: "stats",    label: "Stats"     },
    { id: "papers",   label: "Papers"    },
    { id: "about",    label: "About"     },
] as const;

const NavBar = ({ c, theme, onToggleTheme, onOpenContact }: NavBarProps) => (
    <nav
        className="portfolio-nav"
        style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            zIndex: 50,
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
            FT
        </div>

        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {NAV_LINKS.map(({ id, label }) => (
                <a
                    key={id}
                    href={`#${id}`}
                    style={{ fontFamily: mono, fontSize: "11px", letterSpacing: "1.5px", color: c.muted, textDecoration: "none", textTransform: "uppercase", transition: "color .2s" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = c.text)}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = c.muted)}
                >
                    {label}
                </a>
            ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
                className="theme-toggle"
                onClick={onToggleTheme}
                style={{ fontFamily: mono, fontSize: "11px", letterSpacing: "1px", color: c.muted, background: "none", border: `1px solid ${c.border}`, padding: "7px 14px", borderRadius: "2px", transition: "color .2s, border-color .2s" }}
            >
                {theme === "dark" ? "☀ Light" : "☾ Dark"}
            </button>
            <button
                onClick={onOpenContact}
                style={{ fontFamily: mono, fontSize: "12px", letterSpacing: "0.6px", color: c.bg, background: c.accent, padding: "10px 20px", borderRadius: "2px", fontWeight: 600, border: "none", whiteSpace: "nowrap" }}
            >
                Contact Me
            </button>
        </div>
    </nav>
);

export default NavBar;
