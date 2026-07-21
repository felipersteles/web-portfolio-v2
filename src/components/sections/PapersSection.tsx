import StatueMouse from "../features/Papers/StatueMouse";
import { type Colors, mono, serif } from "../../theme";
import { papers } from "../../data/papers";

interface PapersSectionProps { c: Colors }

const PapersSection = ({ c }: PapersSectionProps) => (
    <section id="papers" style={{ padding: "120px 56px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "2px", color: c.accent, marginBottom: "14px" }}>
                PUBLICATIONS
            </div>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 44px", fontWeight: 700 }}>
                Research Papers
            </h2>
            <div>
                {papers.map((paper, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            gap: "24px", padding: "26px 0", borderBottom: `1px solid ${c.border}`, flexWrap: "wrap",
                        }}
                    >
                        <div style={{ maxWidth: "720px" }}>
                            <h3 style={{ fontSize: "17px", fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{paper.title}</h3>
                            <div style={{ fontFamily: mono, fontSize: "12px", color: c.muted, marginTop: "8px" }}>
                                DOI: {paper.doi}
                            </div>
                        </div>
                        <a
                            href={paper.link}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontFamily: mono, fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", color: c.accent, textDecoration: "none" }}
                        >
                            Read paper →
                        </a>
                    </div>
                ))}
            </div>
        </div>

        <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "340px", height: "420px",
            pointerEvents: "none", opacity: 0.18, zIndex: 0,
        }}>
            <StatueMouse />
        </div>
    </section>
);

export default PapersSection;
