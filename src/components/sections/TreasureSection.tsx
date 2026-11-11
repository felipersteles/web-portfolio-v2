import { mono, serif } from "../../theme";

interface TreasureSectionProps {
    onOpenContact: () => void;
}

const LINKS = [
    { label: "Resume",   href: "/resume" },
    { label: "GitHub",   href: "https://github.com/felipersteles" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/felipersteles" },
    { label: "Scholar",  href: "https://scholar.google.com/citations?user=CpPKPnkAAAAJ&hl=en" },
] as const;

// The last screen of the dive: the camera has reached the sand (OceanScene),
// and an open chest sits on it with the contact button glowing inside.
const TreasureSection = ({ onOpenContact }: TreasureSectionProps) => (
    <section
        id="treasure"
        style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "120px 16px 28px",
            textAlign: "center",
        }}
    >
        <div className="treasure-chest" style={{ position: "relative", width: "min(340px, 82vw)" }}>
            <div aria-hidden="true" className="treasure-glow" />

            <svg viewBox="0 0 320 250" width="100%" aria-hidden="true" style={{ display: "block", position: "relative" }}>
                {/* Lid, thrown open */}
                <path d="M40 112 L62 34 Q160 -6 258 34 L280 112 Z" fill="#6e4120" />
                <path d="M56 108 L74 46 Q160 14 246 46 L264 108 Z" fill="#2e1a0b" />
                <path d="M96 106 L108 24 L124 21 L114 107 Z" fill="#d9a43a" />
                <path d="M206 107 L196 21 L212 24 L224 106 Z" fill="#d9a43a" />

                {/* Gold heaped in the mouth */}
                <ellipse cx="160" cy="122" rx="122" ry="18" fill="#b8862b" />
                {[[92, 114], [124, 108], [160, 104], [196, 108], [228, 114], [110, 120], [146, 116], [178, 116], [212, 120]].map(([x, y], i) => (
                    <ellipse key={i} cx={x} cy={y} rx="13" ry="6" fill={i % 2 ? "#f5cc55" : "#ffdf7a"} stroke="#b8862b" strokeWidth="1" />
                ))}

                {/* Body */}
                <rect x="30" y="122" width="260" height="118" rx="8" fill="#80502a" />
                <path d="M30 160 H290 M30 200 H290" stroke="#5e3a1d" strokeWidth="3" />
                <rect x="30" y="122" width="260" height="14" fill="#d9a43a" />
                <rect x="72" y="122" width="16" height="118" fill="#d9a43a" />
                <rect x="232" y="122" width="16" height="118" fill="#d9a43a" />
                <rect x="144" y="146" width="32" height="38" rx="4" fill="#f0c04a" stroke="#a87a22" strokeWidth="2" />
                <circle cx="160" cy="160" r="5" fill="#3a2410" />
                <rect x="158" y="162" width="4" height="12" fill="#3a2410" />
            </svg>

            <button
                onClick={onOpenContact}
                className="treasure-button"
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "27%",
                    transform: "translate(-50%, -50%)",
                    fontFamily: mono,
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: "#2e1a0b",
                    background: "linear-gradient(180deg, #ffe38a 0%, #f2b93b 100%)",
                    border: "1px solid #a87a22",
                    borderRadius: "999px",
                    padding: "13px 26px",
                }}
            >
                Get in touch ✦
            </button>
        </div>

        <h2 style={{ fontFamily: serif, fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, margin: "28px 0 8px", color: "#fff4d6", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
            You reached the bottom.
        </h2>
        <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(255,244,214,0.75)", margin: "0 0 40px", maxWidth: "360px", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
            Open the chest and let's build something together.
        </p>

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
