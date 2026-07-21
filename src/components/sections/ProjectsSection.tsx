import { useState, useEffect, useRef, useCallback } from "react";
import { type Colors, mono, serif } from "../../theme";
import { projects, type ProjectDTO } from "../../data/projects";

interface ProjectsSectionProps {
    c: Colors;
    filter: "featured" | "all";
    onFilterChange: (f: "featured" | "all") => void;
}

// ── Preview dimensions ─────────────────────────────────────────────────────
const IFRAME_W = 1280;
const IFRAME_H = 800;
const CARD_GAP = 28;

const getLayout = () => {
    if (typeof window === "undefined") return { cardW: 500, trackPad: 56 };
    const vw = window.innerWidth;
    if (vw <= 480) return { cardW: vw - 32, trackPad: 16 };
    if (vw <= 768) return { cardW: vw - 40, trackPad: 20 };
    return { cardW: Math.min(500, vw - 112), trackPad: 56 };
};

// ── Single card ────────────────────────────────────────────────────────────
const ProjectCard = ({
    p, c, isActive, cardW, scale, previewH,
}: {
    p: ProjectDTO; c: Colors; isActive: boolean;
    cardW: number; scale: number; previewH: number;
}) => (
    <div
        className="carousel-card"
        style={{
            flex: `0 0 ${cardW}px`,
            width: `${cardW}px`,
            scrollSnapAlign: "start",
            background: c.surface,
            border: `1px solid ${isActive ? c.accent : c.border}`,
            borderRadius: "6px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "border-color .35s ease, box-shadow .35s ease",
            boxShadow: isActive
                ? `0 0 0 1px ${c.accent}44, 0 24px 64px rgba(0,0,0,0.38)`
                : "0 4px 24px rgba(0,0,0,0.18)",
        }}
    >
        {/* ── Live preview ────────────────────────────────────────────── */}
        <div
            style={{
                position: "relative",
                height: `${previewH}px`,
                overflow: "hidden",
                flexShrink: 0,
                background: c.surfaceAlt,
            }}
        >
            {/* Fallback placeholder (shown while iframe loads or if blocked) */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: mono,
                    fontSize: "12px",
                    letterSpacing: "1.5px",
                    color: c.muted,
                    opacity: 0.35,
                    textTransform: "uppercase",
                }}
            >
                {p.name}
            </div>

            {/* Scaled live iframe — 1280×800 desktop viewport shrunk to card width */}
            <iframe
                src={p.demo}
                loading="lazy"
                title={`${p.name} live preview`}
                tabIndex={-1}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${IFRAME_W}px`,
                    height: `${IFRAME_H}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    border: "none",
                    pointerEvents: "none",
                    display: "block",
                }}
            />

            {/* Bottom gradient — blends preview into card body */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "100px",
                    background: `linear-gradient(to bottom, transparent 0%, ${c.sectionBg} 100%)`,
                    pointerEvents: "none",
                }}
            />

            {/* Top-right badge */}
            {p.star && (
                <span
                    style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        fontFamily: mono,
                        fontSize: "9px",
                        letterSpacing: "1.5px",
                        color: c.accent,
                        background: "rgba(4,8,20,0.72)",
                        border: `1px solid ${c.accent}66`,
                        padding: "4px 9px",
                        borderRadius: "2px",
                        backdropFilter: "blur(8px)",
                        textTransform: "uppercase",
                    }}
                >
                    Featured
                </span>
            )}
        </div>

        {/* ── Card body ──────────────────────────────────────────────── */}
        <div style={{ padding: "24px 26px 26px", display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
            <h3 style={{
                fontFamily: serif,
                fontSize: "22px",
                margin: 0,
                fontWeight: 700,
                lineHeight: 1.25,
                letterSpacing: "-0.2px",
            }}>
                {p.name}
            </h3>

            <p style={{ fontSize: "14px", lineHeight: 1.7, color: c.muted, margin: 0, flex: 1 }}>
                {p.description}
            </p>

            <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                {p.tags.map((tag) => (
                    <span
                        key={tag}
                        style={{ fontFamily: mono, fontSize: "11px", color: c.accent, background: c.chipBg, padding: "4px 10px", borderRadius: "20px" }}
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <div style={{ display: "flex", gap: "20px", paddingTop: "14px", fontFamily: mono, fontSize: "12px", borderTop: `1px solid ${c.border}` }}>
                <a href={p.demo} target="_blank" rel="noreferrer" style={{ color: c.accent, textDecoration: "none", transition: "opacity .2s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
                    Live demo ↗
                </a>
                {p.github && (
                    <a href={p.github} target="_blank" rel="noreferrer" style={{ color: c.muted, textDecoration: "none", transition: "color .2s" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = c.text)}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = c.muted)}>
                        Source ↗
                    </a>
                )}
            </div>
        </div>
    </div>
);

// ── Arrow button ───────────────────────────────────────────────────────────
const ArrowBtn = ({
    dir, disabled, onClick, c,
}: {
    dir: "prev" | "next"; disabled: boolean; onClick: () => void; c: Colors;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        aria-label={dir === "prev" ? "Previous project" : "Next project"}
        style={{
            width: "40px",
            height: "40px",
            borderRadius: "4px",
            border: `1px solid ${disabled ? c.border : c.accent}`,
            background: "none",
            color: disabled ? c.muted : c.accent,
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.38 : 1,
            transition: "background .2s, color .2s, border-color .2s",
            flexShrink: 0,
        }}
        onMouseEnter={(e) => {
            if (!disabled) {
                (e.currentTarget as HTMLElement).style.background = c.accent;
                (e.currentTarget as HTMLElement).style.color = c.bg;
            }
        }}
        onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "none";
            (e.currentTarget as HTMLElement).style.color = disabled ? c.muted : c.accent;
        }}
    >
        {dir === "prev" ? "←" : "→"}
    </button>
);

// ── Section ────────────────────────────────────────────────────────────────
const ProjectsSection = ({ c, filter, onFilterChange }: ProjectsSectionProps) => {
    const filtered = filter === "featured" ? projects.filter((p) => p.star) : projects;

    const [activeIdx, setActiveIdx] = useState(0);
    const [layout, setLayout] = useState(getLayout);
    const scrollRef  = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);

    const { cardW, trackPad } = layout;
    const scale    = cardW / IFRAME_W;
    const previewH = Math.round(IFRAME_H * scale);

    useEffect(() => {
        const onResize = () => setLayout(getLayout());
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Reset carousel when filter changes
    useEffect(() => {
        setActiveIdx(0);
        scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    }, [filter]);

    // Track active card via IntersectionObserver on the scroll container
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        const cards = Array.from(container.children) as HTMLElement[];

        const obs = new IntersectionObserver(
            (entries) => {
                // Pick the entry with highest intersection ratio (most visible)
                let best = entries[0];
                for (const e of entries) {
                    if (e.intersectionRatio > best.intersectionRatio) best = e;
                }
                if (best.isIntersecting) {
                    const idx = cards.indexOf(best.target as HTMLElement);
                    if (idx !== -1) setActiveIdx(idx);
                }
            },
            { root: container, threshold: [0.4, 0.6, 0.8] },
        );
        cards.forEach((card) => obs.observe(card));
        return () => obs.disconnect();
    }, [filtered.length]);

    const scrollToCard = useCallback((idx: number) => {
        const container = scrollRef.current;
        if (!container) return;
        const cards = Array.from(container.children) as HTMLElement[];
        const card  = cards[idx];
        if (!card) return;
        const containerLeft = container.getBoundingClientRect().left;
        const cardLeft      = card.getBoundingClientRect().left;
        const delta         = cardLeft - containerLeft - trackPad;
        container.scrollBy({ left: delta, behavior: "smooth" });
        setActiveIdx(idx);
    }, [trackPad]);

    const goTo = useCallback((delta: -1 | 1) => {
        scrollToCard(Math.min(Math.max(activeIdx + delta, 0), filtered.length - 1));
    }, [activeIdx, filtered.length, scrollToCard]);

    // Section reveal
    useEffect(() => {
        const el = sectionRef.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
        targets.forEach((t) => { t.style.opacity = "0"; t.style.transform = "translateY(20px)"; });

        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        (entry.target as HTMLElement).querySelectorAll<HTMLElement>("[data-reveal]")
                            .forEach((child, i) => {
                                child.style.transition = `opacity 0.65s ease ${i * 0.08}s, transform 0.65s ease ${i * 0.08}s`;
                                child.style.opacity = "1";
                                child.style.transform = "none";
                            });
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="projects"
            style={{ padding: "120px 0", background: c.sectionBg, overflow: "hidden" }}
        >
            {/* ── Header ───────────────────────────────────────────────── */}
            <div style={{ padding: `0 ${trackPad}px`, marginBottom: "44px" }}>
                <div
                    data-reveal
                    className="section-label"
                    style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "2px", color: c.accent, marginBottom: "16px", display: "inline-block" }}
                >
                    PORTFOLIO
                </div>

                <div data-reveal style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                    <h2 style={{ fontFamily: serif, fontSize: "clamp(28px, 4vw, 44px)", margin: 0, fontWeight: 700, letterSpacing: "-0.3px" }}>
                        Selected Projects
                    </h2>

                    {/* Controls: counter + arrows + filter */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        {/* Prev / counter / Next */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <ArrowBtn dir="prev" disabled={activeIdx === 0}             onClick={() => goTo(-1)} c={c} />
                            <span style={{ fontFamily: mono, fontSize: "12px", color: c.muted, minWidth: "48px", textAlign: "center" }}>
                                {String(activeIdx + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
                            </span>
                            <ArrowBtn dir="next" disabled={activeIdx === filtered.length - 1} onClick={() => goTo(1)}  c={c} />
                        </div>

                        {/* Filter */}
                        <div style={{ display: "flex", gap: "8px" }}>
                            {(["featured", "all"] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => onFilterChange(f)}
                                    style={{
                                        fontFamily: mono, fontSize: "11px", letterSpacing: "0.5px",
                                        padding: "8px 14px", borderRadius: "4px", transition: "all .2s",
                                        background: filter === f ? c.accent : "none",
                                        color:      filter === f ? c.bg    : c.muted,
                                        border: `1px solid ${filter === f ? c.accent : c.border}`,
                                        cursor: "pointer",
                                    }}
                                >
                                    {f === "featured" ? "Featured" : `All (${projects.length})`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Carousel track ───────────────────────────────────────── */}
            <div
                ref={scrollRef}
                style={{
                    display: "flex",
                    gap: `${CARD_GAP}px`,
                    overflowX: "auto",
                    overflowY: "visible",
                    scrollSnapType: "x mandatory",
                    scrollBehavior: "smooth",
                    scrollPaddingLeft: `${trackPad}px`,
                    paddingLeft: `${trackPad}px`,
                    paddingRight: `${trackPad}px`,
                    paddingBottom: "32px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                } as React.CSSProperties}
            >
                {filtered.map((p, i) => (
                    <ProjectCard key={p.id} p={p} c={c} isActive={i === activeIdx}
                        cardW={cardW} scale={scale} previewH={previewH} />
                ))}
            </div>

            {/* ── Dot indicators ───────────────────────────────────────── */}
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: "8px",
                }}
            >
                {filtered.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => scrollToCard(i)}
                        aria-label={`Go to project ${i + 1}`}
                        style={{
                            width:        i === activeIdx ? "28px" : "7px",
                            height:       "7px",
                            borderRadius: "4px",
                            background:   i === activeIdx ? c.accent : c.muted,
                            border:       "none",
                            padding:      0,
                            cursor:       "pointer",
                            transition:   "width .35s ease, background .25s ease",
                            opacity:      i === activeIdx ? 1 : 0.4,
                        }}
                    />
                ))}
            </div>
        </section>
    );
};

export default ProjectsSection;
