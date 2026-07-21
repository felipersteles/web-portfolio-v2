import { type Colors, mono } from "../../theme";

interface FooterSectionProps { c: Colors }

const LINKS = [
    { label: "GitHub",   href: "https://github.com/felipersteles" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/felipersteles" },
    { label: "Scholar",  href: "https://scholar.google.com/citations?user=CpPKPnkAAAAJ&hl=en" },
    { label: "Email",    href: "mailto:felipersteles@gmail.com" },
] as const;

const FooterSection = ({ c }: FooterSectionProps) => (
    <footer style={{
        padding: "40px 56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: `1px solid ${c.border}`,
        background: c.sectionBg,
        fontFamily: mono,
        fontSize: "12px",
        color: c.muted,
        flexWrap: "wrap",
        gap: "16px",
    }}>
        <div>© {new Date().getFullYear()} Felipe Teles</div>
        <div style={{ display: "flex", gap: "24px" }}>
            {LINKS.map(({ label, href }) => (
                <a key={label} href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer"
                    style={{ color: c.muted, textDecoration: "none" }}>
                    {label}
                </a>
            ))}
        </div>
    </footer>
);

export default FooterSection;
