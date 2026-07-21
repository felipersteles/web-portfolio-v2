import { type Colors, mono, serif } from "../../theme";
import { projects, type ProjectDTO } from "../../data/projects";

interface ProjectsSectionProps {
    c: Colors;
    filter: "featured" | "all";
    onFilterChange: (f: "featured" | "all") => void;
}

const ProjectCard = ({ p, c }: { p: ProjectDTO; c: Colors }) => (
    <div
        style={{
            background: c.surface,
            border: `1px solid ${c.border}`,
            borderRadius: "4px",
            padding: "26px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
        }}
    >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <h3 style={{ fontSize: "19px", margin: 0, fontWeight: 600 }}>{p.name}</h3>
            {p.star && (
                <span style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "1px", color: c.accent, border: `1px solid ${c.border}`, padding: "3px 8px", borderRadius: "2px", whiteSpace: "nowrap", flexShrink: 0 }}>
                    FEATURED
                </span>
            )}
        </div>

        <p style={{ fontSize: "14px", lineHeight: 1.6, color: c.muted, margin: 0, minHeight: "44px" }}>
            {p.description}
        </p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {p.tags.map((tag) => (
                <span key={tag} style={{ fontFamily: mono, fontSize: "11px", color: c.accent, background: c.chipBg, padding: "4px 10px", borderRadius: "20px" }}>
                    {tag}
                </span>
            ))}
        </div>

        <div style={{ display: "flex", gap: "18px", marginTop: "6px", fontFamily: mono, fontSize: "12px" }}>
            <a href={p.demo} target="_blank" rel="noreferrer" style={{ color: c.accent, textDecoration: "none" }}>
                Demo ↗
            </a>
            {p.github && (
                <a href={p.github} target="_blank" rel="noreferrer" style={{ color: c.muted, textDecoration: "none" }}>
                    Source ↗
                </a>
            )}
        </div>
    </div>
);

const ProjectsSection = ({ c, filter, onFilterChange }: ProjectsSectionProps) => {
    const filtered = filter === "featured" ? projects.filter((p) => p.star) : projects;

    return (
        <section id="projects" style={{ padding: "120px 56px" }}>
            <div style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "2px", color: c.accent, marginBottom: "14px" }}>
                PORTFOLIO
            </div>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "44px", flexWrap: "wrap", gap: "20px" }}>
                <h2 style={{ fontFamily: serif, fontSize: "clamp(28px, 4vw, 42px)", margin: 0, fontWeight: 700 }}>
                    Selected Projects
                </h2>
                <div style={{ display: "flex", gap: "10px" }}>
                    {(["featured", "all"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => onFilterChange(f)}
                            style={{
                                fontFamily: mono, fontSize: "12px", letterSpacing: "0.5px", padding: "8px 16px", borderRadius: "2px", transition: "all .2s",
                                background: filter === f ? c.accent : "none",
                                color: filter === f ? c.bg : c.muted,
                                border: `1px solid ${filter === f ? c.accent : c.border}`,
                            }}
                        >
                            {f === "featured" ? "Featured" : `All (${projects.length})`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="projects-grid">
                {filtered.map((p) => (
                    <ProjectCard key={p.id} p={p} c={c} />
                ))}
            </div>
        </section>
    );
};

export default ProjectsSection;
