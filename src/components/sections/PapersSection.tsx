import { useEffect, useRef } from "react";
import { type Colors, mono, serif } from "../../theme";
import { papers } from "../../data/papers";

interface PapersSectionProps { c: Colors }

const PapersSection = ({ c }: PapersSectionProps) => {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion) return;

        const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
        targets.forEach((t) => {
            t.style.opacity = "0";
            t.style.transform = "translateY(22px)";
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const children = (entry.target as HTMLElement).querySelectorAll<HTMLElement>("[data-reveal]");
                        children.forEach((child, i) => {
                            child.style.transition = `opacity 0.65s ease ${i * 0.10}s, transform 0.65s ease ${i * 0.10}s`;
                            child.style.opacity = "1";
                            child.style.transform = "none";
                        });
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="papers"
            style={{ padding: "120px 56px", background: c.sectionBg }}
        >
            <div
                data-reveal
                className="section-label"
                style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "2px", color: c.accent, marginBottom: "14px", display: "inline-block" }}
            >
                PUBLICATIONS
            </div>
            <h2 data-reveal style={{ fontFamily: serif, fontSize: "clamp(28px, 4vw, 44px)", margin: "0 0 48px", fontWeight: 700, letterSpacing: "-0.3px" }}>
                Research Papers
            </h2>

            <div>
                {papers.map((paper, i) => (
                    <div
                        key={i}
                        data-reveal
                        className="paper-row"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "24px",
                            padding: "28px 0",
                            borderBottom: `1px solid ${c.border}`,
                            flexWrap: "wrap",
                        }}
                    >
                        <div style={{ maxWidth: "680px" }}>
                            <h3 style={{ fontSize: "17px", fontWeight: 600, lineHeight: 1.45, margin: 0 }}>{paper.title}</h3>
                            <div style={{ fontFamily: mono, fontSize: "12px", color: c.muted, marginTop: "10px" }}>
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
        </section>
    );
};

export default PapersSection;
