import { useEffect, useState } from "react";
import { darkColors, lightColors, mono, serif, heading } from "../theme";
import { EDUCATION, EXPERIENCE, SUMMARY } from "../data/experience";
import FooterSection from "../components/sections/FooterSection";

const ResumePage = () => {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const c = theme === "dark" ? darkColors : lightColors;

    useEffect(() => {
        document.body.style.background = c.bg;
        document.body.style.transition = "background 0.3s";
        document.documentElement.style.setProperty("--accent", c.accent);
    }, [c.bg, c.accent]);

    return (
        <div
            style={{
                minHeight: "100vh",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                color: c.text,
                background: c.bg,
                transition: "color .3s, background .3s",
            }}
        >
            <header
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
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
                <a
                    href="/"
                    style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "inherit" }}
                >
                    <img src="/logo.png" alt="FTeles logo" style={{ width: "28px", height: "28px", objectFit: "contain" }} />
                    <span style={{ fontFamily: heading, fontSize: "14px", letterSpacing: "2px", color: c.accent, fontWeight: 600 }}>
                        FTeles
                    </span>
                </a>

                <button
                    onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                    style={{
                        fontFamily: heading, fontSize: "11px", letterSpacing: "1px", color: c.muted,
                        background: "none", border: `1px solid ${c.border}`, padding: "7px 14px",
                        borderRadius: "2px", transition: "color .2s, border-color .2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = c.text; (e.currentTarget as HTMLElement).style.borderColor = c.text; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = c.muted; (e.currentTarget as HTMLElement).style.borderColor = c.border; }}
                >
                    {theme === "dark" ? "☀ Light" : "☾ Dark"}
                </button>
            </header>

            <main style={{ maxWidth: "840px", margin: "0 auto", padding: "72px 56px 96px" }}>
                <div className="section-label" style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "2px", color: c.accent, marginBottom: "14px", display: "inline-block" }}>
                    RESUME
                </div>
                <h1 style={{ fontFamily: serif, fontSize: "clamp(32px, 5vw, 48px)", margin: "0 0 6px", fontWeight: 700, letterSpacing: "-0.3px" }}>
                    Felipe Teles
                </h1>
                <p style={{ fontFamily: mono, fontSize: "14px", color: c.accent, margin: "0 0 28px" }}>
                    Senior Software Engineer
                </p>
                <p style={{ fontSize: "16px", lineHeight: 1.7, color: c.muted, maxWidth: "680px", margin: "0 0 56px" }}>
                    {SUMMARY}
                </p>

                <h2 style={{ fontFamily: serif, fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, margin: "0 0 28px" }}>
                    Experience
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "56px" }}>
                    {EXPERIENCE.map((item) => (
                        <div
                            key={item.company}
                            className="paper-row"
                            style={{ padding: "22px 20px", borderRadius: "4px" }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "8px" }}>
                                <div>
                                    <h3 style={{ fontFamily: serif, fontSize: "19px", fontWeight: 700, margin: 0 }}>
                                        {item.company}
                                    </h3>
                                    <p style={{ fontSize: "13px", color: c.muted, margin: "2px 0 0" }}>
                                        {item.description}
                                    </p>
                                </div>
                                <span style={{ fontFamily: mono, fontSize: "12px", color: c.accent, background: c.chipBg, padding: "4px 10px", borderRadius: "20px", whiteSpace: "nowrap" }}>
                                    {item.period}
                                </span>
                            </div>
                            <p style={{ fontFamily: mono, fontSize: "12px", fontWeight: 600, color: c.text, margin: "10px 0 12px" }}>
                                {item.role}
                            </p>
                            <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                {item.highlights.map((h) => (
                                    <li key={h} style={{ fontSize: "14px", lineHeight: 1.6, color: c.muted }}>
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <h2 style={{ fontFamily: serif, fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, margin: "0 0 20px" }}>
                    Education
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {EDUCATION.map((edu) => (
                        <div key={edu.degree} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                            <div>
                                <div style={{ fontSize: "15px", fontWeight: 600 }}>{edu.degree}</div>
                                <div style={{ fontSize: "13px", color: c.muted }}>{edu.school}</div>
                            </div>
                            <span style={{ fontFamily: mono, fontSize: "12px", color: c.muted }}>{edu.period}</span>
                        </div>
                    ))}
                </div>

                <a
                    href="https://felipersteles.github.io/resume.html"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        display: "inline-block", marginTop: "56px", fontFamily: mono, fontSize: "13px",
                        fontWeight: 600, color: c.bg, background: c.accent, padding: "12px 24px",
                        borderRadius: "2px", textDecoration: "none", transition: "opacity .2s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.82")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                >
                    View Full Resume ↗
                </a>
            </main>

            <FooterSection c={c} />
        </div>
    );
};

export default ResumePage;
