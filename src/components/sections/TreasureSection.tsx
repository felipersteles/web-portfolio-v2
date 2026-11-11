import { mono, serif } from "../../theme";

interface TreasureSectionProps {
    onOpenChest: () => void;
}

const LINKS = [
    { label: "Resume",   href: "/resume" },
    { label: "GitHub",   href: "https://github.com/felipersteles" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/felipersteles" },
    { label: "Scholar",  href: "https://scholar.google.com/citations?user=CpPKPnkAAAAJ&hl=en" },
] as const;

// The last screen of the dive: the camera has reached the sand and the 3D
// chest (OceanScene) sits in the lower half. Clicking it — or the button
// here, for keyboard users — plays the chest animation, then the contact
// page rises.
const TreasureSection = ({ onOpenChest }: TreasureSectionProps) => (
    <section
        id="treasure"
        style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18vh 16px 28px",
            textAlign: "center",
        }}
    >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(24px, 3.4vw, 36px)", fontWeight: 700, margin: "0 0 10px", color: "#fff4d6", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
                You reached the bottom.
            </h2>
            <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(255,244,214,0.75)", margin: "0 0 24px", maxWidth: "380px", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
                There's a chest down here. Open it and let's build something together.
            </p>
            <button onClick={onOpenChest} className="treasure-button">
                Open the chest ✦
            </button>
        </div>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center", fontFamily: mono, fontSize: "11px" }}>
            {LINKS.map(({ label, href }) => (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                    style={{ color: "rgba(255,244,214,0.6)", textDecoration: "none" }}>
                    {label}
                </a>
            ))}
            <span style={{ color: "rgba(255,244,214,0.4)" }}>© {new Date().getFullYear()} Felipe Teles</span>
        </div>
    </section>
);

export default TreasureSection;
