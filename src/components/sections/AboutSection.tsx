import { type Colors, mono, serif } from "../../theme";
import { FELIPE_TELES } from "../../data/about";
import meImg from "../../assets/imgs/rio.jpeg";

const skills = ["React / Next.js", "TypeScript", "NestJS", "Computer Vision", "Deep Learning"];

interface AboutSectionProps { c: Colors }

const AboutSection = ({ c }: AboutSectionProps) => (
    <section
        id="about"
        className="about-section"
        style={{
            padding: "120px 56px",
            background: c.surfaceAlt,
            display: "flex",
            gap: "56px",
            alignItems: "flex-start",
            flexWrap: "wrap",
        }}
    >
        <img
            src={meImg}
            alt="Felipe Teles - Senior Software Engineer and AI researcher from Brazil"
            className="about-img"
            style={{ width: "380px", height: "460px", objectFit: "cover", borderRadius: "4px", flexShrink: 0, display: "block" }}
        />
        <div style={{ maxWidth: "640px", flex: 1, minWidth: "280px" }}>
            <div style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "2px", color: c.accent, marginBottom: "14px" }}>
                ABOUT
            </div>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(26px, 3.5vw, 38px)", margin: "0 0 20px", fontWeight: 700, lineHeight: 1.2 }}>
                Software developer,<br />applied ML researcher.
            </h2>
            {FELIPE_TELES.bio.map((para, i) => (
                <p key={i} style={{ fontSize: "16px", lineHeight: 1.8, color: c.muted, margin: "0 0 16px" }}>
                    {para}
                </p>
            ))}
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "28px" }}>
                <a href={FELIPE_TELES.resume} target="_blank" rel="noreferrer"
                    style={{ fontFamily: mono, fontSize: "13px", color: c.accent, textDecoration: "none" }}>
                    View full resume →
                </a>
                <a href="https://tedebc.ufma.br/jspui/handle/tede/6962" target="_blank" rel="noreferrer"
                    style={{ fontFamily: mono, fontSize: "13px", color: c.muted, textDecoration: "none" }}>
                    Master's dissertation →
                </a>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {skills.map((skill) => (
                    <span key={skill} style={{ fontFamily: mono, fontSize: "12px", color: c.accent, background: c.chipBg, padding: "6px 14px", borderRadius: "20px" }}>
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    </section>
);

export default AboutSection;
