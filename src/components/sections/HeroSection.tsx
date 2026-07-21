import { useEffect, useRef } from "react";
import { type Colors, mono, serif } from "../../theme";

interface HeroSectionProps {
    c: Colors;
}

// Staggered fade-up reveal for hero children on mount
const useFadeIn = (ref: { readonly current: HTMLElement | null }) => {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion) {
            el.querySelectorAll<HTMLElement>("[data-reveal]").forEach((child) => {
                child.style.opacity = "1";
                child.style.transform = "none";
            });
            return;
        }
        const children = el.querySelectorAll<HTMLElement>("[data-reveal]");
        children.forEach((child, i) => {
            child.style.opacity = "0";
            child.style.transform = "translateY(28px)";
            child.style.transition = `opacity 0.75s ease ${i * 0.12}s, transform 0.75s ease ${i * 0.12}s`;
        });
        const id = setTimeout(() => {
            children.forEach((child) => {
                child.style.opacity = "1";
                child.style.transform = "none";
            });
        }, 80);
        return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};

// Inline hover handler helpers to keep JSX lean
const hoverIn  = (bg: string) => (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.opacity = "0.80"; void bg; };
const hoverOut = ()            => (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.opacity = "1"; };
const borderIn  = (color: string) => (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.color = color; };
const borderOut = (color: string, dim: string) => (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.borderColor = dim; (e.currentTarget as HTMLElement).style.color = dim; };

const HeroSection = ({ c }: HeroSectionProps) => {
    const sectionRef = useRef<HTMLElement>(null);
    useFadeIn(sectionRef);

    return (
        <section
            ref={sectionRef}
            id="hero"
            className="hero-section"
            style={{
                minHeight: "90vh",
                display: "flex",
                alignItems: "center",
                padding: "90px 56px 80px",
                background: "transparent",
                position: "relative",
            }}
        >
            {/* Text block — left-aligned; orb (fixed canvas) occupies the right */}
            <div style={{ maxWidth: "580px", position: "relative", zIndex: 2 }}>

                {/* Overline label */}
                <div
                    data-reveal
                    className="section-label"
                    style={{
                        fontFamily: mono,
                        fontSize: "clamp(11px, 1.1vw, 13px)",
                        letterSpacing: "2.5px",
                        color: c.accent,
                        marginBottom: "22px",
                        textTransform: "uppercase",
                        display: "inline-block",
                    }}
                >
                    MSc · Senior Software Developer
                </div>

                <h1
                    data-reveal
                    style={{
                        fontFamily: serif,
                        fontSize: "clamp(46px, 6.5vw, 82px)",
                        lineHeight: 1.04,
                        margin: "0 0 28px",
                        fontWeight: 700,
                        letterSpacing: "-0.5px",
                    }}
                >
                    Felipe<br />Teles
                </h1>

                <p
                    data-reveal
                    style={{
                        fontSize: "clamp(15px, 1.4vw, 18px)",
                        lineHeight: 1.75,
                        color: c.muted,
                        margin: "0 0 40px",
                        maxWidth: "480px",
                    }}
                >
                    I build full-stack products end to end and research applied
                    machine learning for medical image analysis. Twelve shipped
                    projects, three peer-reviewed papers, and a decade-deep
                    changelog on GitHub.
                </p>

                <div data-reveal style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                    <a
                        href="#projects"
                        style={{
                            fontFamily: mono,
                            fontSize: "12px",
                            fontWeight: 600,
                            letterSpacing: "0.8px",
                            color: c.bg,
                            background: c.accent,
                            padding: "14px 28px",
                            borderRadius: "2px",
                            textDecoration: "none",
                            textTransform: "uppercase",
                            transition: "opacity .2s",
                        }}
                        onMouseEnter={hoverIn(c.accent)}
                        onMouseLeave={hoverOut()}
                    >
                        View Projects →
                    </a>
                    <a
                        href="#papers"
                        style={{
                            fontFamily: mono,
                            fontSize: "12px",
                            fontWeight: 600,
                            letterSpacing: "0.8px",
                            color: c.muted,
                            border: `1px solid ${c.border}`,
                            padding: "14px 28px",
                            borderRadius: "2px",
                            textDecoration: "none",
                            textTransform: "uppercase",
                            transition: "border-color .2s, color .2s",
                        }}
                        onMouseEnter={borderIn(c.text)}
                        onMouseLeave={borderOut(c.border, c.muted)}
                    >
                        Read Papers
                    </a>
                </div>

                {/* Animated scroll hint */}
                <div
                    data-reveal
                    style={{
                        marginTop: "72px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "8px",
                    }}
                >
                    <div
                        className="scroll-arrow"
                        style={{
                            fontFamily: mono,
                            fontSize: "18px",
                            color: c.accent,
                            lineHeight: 1,
                        }}
                    >
                        ↓
                    </div>
                    <div style={{
                        fontFamily: mono,
                        fontSize: "10px",
                        letterSpacing: "2px",
                        color: c.muted,
                        textTransform: "uppercase",
                        opacity: 0.55,
                    }}>
                        Scroll to explore
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
