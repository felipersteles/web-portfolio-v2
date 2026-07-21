import { type Colors, mono, serif } from "../../theme";

interface ContactModalProps {
    c: Colors;
    theme: "dark" | "light";
    onClose: () => void;
}

const SOCIALS = [
    { label: "GitHub",   href: "https://github.com/felipersteles" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/felipersteles" },
    { label: "Scholar",  href: "https://scholar.google.com/citations?user=CpPKPnkAAAAJ&hl=en" },
] as const;

const ContactModal = ({ c, theme, onClose }: ContactModalProps) => (
    <div
        onClick={onClose}
        style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
        }}
    >
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                background: theme === "dark" ? "#1a1612" : "#ffffff",
                border: `1px solid ${c.border}`,
                borderRadius: "4px",
                padding: "48px 52px",
                maxWidth: "480px",
                width: "100%",
                position: "relative",
            }}
        >
            <button
                onClick={onClose}
                style={{ position: "absolute", top: "16px", right: "20px", background: "none", border: "none", color: c.muted, fontSize: "18px", cursor: "pointer", lineHeight: 1 }}
            >
                ✕
            </button>

            <div style={{ fontFamily: mono, fontSize: "11px", letterSpacing: "2px", color: c.accent, marginBottom: "12px" }}>
                GET IN TOUCH
            </div>
            <h2 style={{ fontFamily: serif, fontSize: "32px", fontWeight: 700, margin: "0 0 16px", color: c.text }}>
                Let's talk.
            </h2>
            <p style={{ fontSize: "15px", lineHeight: 1.7, color: c.muted, margin: "0 0 36px" }}>
                I'm open to collaborations, research discussions, and new opportunities. Reach me directly by email or through any of my networks below.
            </p>

            <a
                href="mailto:felipersteles@gmail.com"
                style={{ display: "block", fontFamily: mono, fontSize: "14px", color: c.accent, textDecoration: "none", marginBottom: "32px", fontWeight: 600 }}
            >
                felipersteles@gmail.com ↗
            </a>

            <div style={{ display: "flex", gap: "24px", fontFamily: mono, fontSize: "12px", flexWrap: "wrap" }}>
                {SOCIALS.map(({ label, href }) => (
                    <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: c.muted, textDecoration: "none", borderBottom: `1px solid ${c.border}`, paddingBottom: "2px", transition: "color .2s, border-color .2s" }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.color = c.accent;
                            (e.target as HTMLElement).style.borderColor = c.accent;
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.color = c.muted;
                            (e.target as HTMLElement).style.borderColor = c.border;
                        }}
                    >
                        {label} ↗
                    </a>
                ))}
            </div>
        </div>
    </div>
);

export default ContactModal;
