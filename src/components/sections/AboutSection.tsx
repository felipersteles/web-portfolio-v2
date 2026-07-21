import { useRef, useEffect } from "react";
import { type Colors, mono, serif } from "../../theme";
import { FELIPE_TELES } from "../../data/about";
import StatueMouse from "../features/Papers/StatueMouse";
import meImg from "../../assets/imgs/rio.jpeg";

const skills = ["React / Next.js", "TypeScript", "NestJS", "Computer Vision", "Deep Learning"];

interface AboutSectionProps { c: Colors }

const AboutSection = ({ c }: AboutSectionProps) => {
    const sectionRef = useRef<HTMLElement>(null);
    const photoWrapRef = useRef<HTMLDivElement>(null);

    // Scroll reveal
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion) return;

        const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
        targets.forEach((t) => {
            t.style.opacity = "0";
            t.style.transform = "translateY(24px)";
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const children = (entry.target as HTMLElement).querySelectorAll<HTMLElement>("[data-reveal]");
                        children.forEach((child, i) => {
                            child.style.transition = `opacity 0.70s ease ${i * 0.10}s, transform 0.70s ease ${i * 0.10}s`;
                            child.style.opacity = "1";
                            child.style.transform = "none";
                        });
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.06 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // 3-D tilt effect on photo
    const handlePhotoMove = (e: React.MouseEvent) => {
        const el = photoWrapRef.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5..0.5
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        el.style.transition = "transform 0.08s ease";
        el.style.transform  = `perspective(900px) rotateY(${x * 20}deg) rotateX(${-y * 14}deg) scale3d(1.03, 1.03, 1.03)`;
    };

    const handlePhotoLeave = () => {
        const el = photoWrapRef.current;
        if (!el) return;
        el.style.transition = "transform 0.55s ease";
        el.style.transform  = "perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    };

    return (
        <section
            ref={sectionRef}
            id="about"
            className="about-section"
            style={{
                padding: "120px 56px",
                background: c.sectionBg,
                display: "flex",
                gap: "56px",
                alignItems: "flex-start",
                flexWrap: "wrap",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Statue 3D decoration — absolute, behind content */}
            <div
                style={{
                    position: "absolute",
                    right: "-10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "240px",
                    height: "380px",
                    opacity: 0.13,
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            >
                <StatueMouse />
            </div>

            {/* Photo with 3-D tilt */}
            <div
                data-reveal
                ref={photoWrapRef}
                className="about-img"
                onMouseMove={handlePhotoMove}
                onMouseLeave={handlePhotoLeave}
                style={{
                    width: "360px",
                    height: "450px",
                    flexShrink: 0,
                    borderRadius: "4px",
                    overflow: "hidden",
                    willChange: "transform",
                    cursor: "default",
                    position: "relative",
                    zIndex: 1,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                }}
            >
                <img
                    src={meImg}
                    alt="Felipe Teles — Senior Software Engineer and AI researcher"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
            </div>

            {/* Text */}
            <div style={{ maxWidth: "620px", flex: 1, minWidth: "280px", position: "relative", zIndex: 1 }}>
                <div data-reveal className="section-label" style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "2px", color: c.accent, marginBottom: "14px", display: "inline-block" }}>
                    ABOUT
                </div>
                <h2 data-reveal style={{ fontFamily: serif, fontSize: "clamp(26px, 3.5vw, 40px)", margin: "0 0 22px", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.3px" }}>
                    Software developer,<br />applied ML researcher.
                </h2>
                {FELIPE_TELES.bio.map((para, i) => (
                    <p
                        key={i}
                        data-reveal
                        style={{ fontSize: "16px", lineHeight: 1.82, color: c.muted, margin: "0 0 16px" }}
                    >
                        {para}
                    </p>
                ))}
                <div data-reveal style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "28px" }}>
                    <a href={FELIPE_TELES.resume} target="_blank" rel="noreferrer"
                        style={{ fontFamily: mono, fontSize: "13px", color: c.accent, textDecoration: "none" }}>
                        View full resume →
                    </a>
                    <a href="https://tedebc.ufma.br/jspui/handle/tede/6962" target="_blank" rel="noreferrer"
                        style={{ fontFamily: mono, fontSize: "13px", color: c.muted, textDecoration: "none" }}>
                        Master's dissertation →
                    </a>
                </div>
                <div data-reveal style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {skills.map((skill) => (
                        <span key={skill} style={{ fontFamily: mono, fontSize: "12px", color: c.accent, background: c.chipBg, padding: "6px 14px", borderRadius: "20px" }}>
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
