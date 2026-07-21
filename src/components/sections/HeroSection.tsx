import Earth from "../features/Home/Earth";
import { type Colors, mono, serif } from "../../theme";

interface HeroSectionProps {
    c: Colors;
    theme: "dark" | "light";
}

const HeroSection = ({ c, theme }: HeroSectionProps) => (
    <section
        className="hero-section"
        style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "40px",
            padding: "160px 56px 80px",
            position: "relative",
            overflow: "hidden",
            flexWrap: "wrap",
        }}
    >
        <div style={{ maxWidth: "600px", position: "relative", zIndex: 2 }}>
            <div style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "2px", color: c.accent, marginBottom: "20px" }}>
                MSc · SENIOR SOFTWARE DEVELOPER
            </div>
            <h1 style={{ fontFamily: serif, fontSize: "clamp(44px, 6vw, 76px)", lineHeight: 1.05, margin: "0 0 24px", fontWeight: 700 }}>
                Felipe Teles
            </h1>
            <p style={{ fontSize: "18px", lineHeight: 1.7, color: c.muted, margin: "0 0 36px", maxWidth: "520px" }}>
                I build full-stack products end to end and research applied machine learning
                for medical image analysis. Twelve shipped projects, three peer-reviewed papers,
                and a decade-deep changelog on GitHub.
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <a href="#projects" style={{ fontFamily: mono, fontSize: "13px", fontWeight: 600, letterSpacing: "0.5px", color: c.bg, background: c.accent, padding: "14px 26px", borderRadius: "2px", textDecoration: "none" }}>
                    View Projects →
                </a>
                <a href="#papers" style={{ fontFamily: mono, fontSize: "13px", fontWeight: 600, letterSpacing: "0.5px", color: c.text, border: `1px solid ${c.border}`, padding: "14px 26px", borderRadius: "2px", textDecoration: "none" }}>
                    Read Papers
                </a>
            </div>
        </div>

        <div
            className="globe-wrapper"
            style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}
        >
            <div className="globe-canvas" key={theme}>
                <Earth />
            </div>
            <div style={{ fontFamily: mono, fontSize: "11px", letterSpacing: "1px", color: c.muted }}>
                DRAG TO ROTATE
            </div>
        </div>
    </section>
);

export default HeroSection;
