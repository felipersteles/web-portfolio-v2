import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { mono } from "../theme";
import SurfTunnelScene, { BOARD_CONFIG } from "./features/Loading/SurfTunnelScene";

const boardWidth = `min(${BOARD_CONFIG.widthVw}vw, ${BOARD_CONFIG.widthMaxPx}px)`;
const boardMarginLeft = `min(-${BOARD_CONFIG.widthVw / 2}vw, -${BOARD_CONFIG.widthMaxPx / 2}px)`;
const boardBottom = `calc(${BOARD_CONFIG.bottomFactor} * ${boardWidth})`;
const boardRotateFrom = BOARD_CONFIG.baseTiltDeg - BOARD_CONFIG.swayDeg / 2;
const boardRotateTo = BOARD_CONFIG.baseTiltDeg + BOARD_CONFIG.swayDeg / 2;

interface SurfLoaderProps {
    /** Keep true while the app is loading; flip to false when ready. */
    isLoading?: boolean;
    /** Fires once the current loop has finished and the fade-out has completed. */
    onExited?: () => void;
}

const LOOP_MS = 2000;
const EXIT_MS = 700;

const SurfLoader = ({ isLoading = true, onExited }: SurfLoaderProps) => {
    const [phase, setPhase] = useState<"loading" | "exiting" | "hidden">("loading");
    const startRef = useRef(performance.now());
    const [reducedMotion] = useState(
        () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );

    useEffect(() => {
        if (isLoading) {
            setPhase("loading");
            return;
        }
        if (reducedMotion) {
            setPhase("exiting");
            return;
        }
        // Don't cut the loop short — finish the current 2s cycle first.
        const elapsed = (performance.now() - startRef.current) % LOOP_MS;
        const remaining = LOOP_MS - elapsed;
        const t = setTimeout(() => setPhase("exiting"), remaining);
        return () => clearTimeout(t);
    }, [isLoading, reducedMotion]);

    useEffect(() => {
        if (phase !== "exiting") return;
        const t = setTimeout(() => {
            setPhase("hidden");
            onExited?.();
        }, EXIT_MS);
        return () => clearTimeout(t);
    }, [phase, onExited]);

    if (phase === "hidden") return null;

    return (
        <motion.div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                overflow: "hidden",
                background: "#000000",
            }}
            animate={{ opacity: phase === "exiting" ? 0 : 1, y: phase === "exiting" ? -14 : 0 }}
            transition={{ duration: EXIT_MS / 1000, ease: [0.6, 0, 0.15, 1] }}
        >
            <SurfTunnelScene reducedMotion={reducedMotion} />

            {!reducedMotion && <div aria-hidden="true" className="tunnel-flash" />}

            {/* Board nose — sells the first-person "you're riding it" read */}
            <motion.svg
                aria-hidden="true"
                viewBox="0 0 220 170"
                width={boardWidth}
                style={{
                    position: "absolute",
                    left: `${BOARD_CONFIG.leftPercent}%`,
                    bottom: boardBottom,
                    zIndex: 1,
                    marginLeft: boardMarginLeft,
                }}
                initial={false}
                animate={
                    reducedMotion
                        ? { rotate: BOARD_CONFIG.reducedTiltDeg, y: 0 }
                        : { rotate: [boardRotateFrom, boardRotateTo, boardRotateFrom], y: [0, -BOARD_CONFIG.bobPx, 0] }
                }
                transition={reducedMotion ? undefined : { duration: BOARD_CONFIG.swayDurationS, repeat: Infinity, ease: "easeInOut" }}
            >
                <path
                    d="M 110 0 C 72 42 42 92 31 162 L 189 162 C 178 92 148 42 110 0 Z"
                    fill="#ffffff"
                    fillOpacity={0.92}
                />
                <path d="M 110 8 L 110 162" stroke="#00B5D8" strokeWidth={1.4} opacity={0.8} />
            </motion.svg>

            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: "50%",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                }}
            >
                <span style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "3px", color: "#ffffff" }}>
                    ENJOY THE BARREL
                </span>

                <div style={{ display: "flex", gap: "8px" }}>
                    {[0, 1, 2, 3].map((i) => (
                        <motion.span
                            key={i}
                            style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00B5D8" }}
                            initial={false}
                            animate={
                                reducedMotion
                                    ? { opacity: i === 0 ? 1 : 0.35, scale: 1 }
                                    : {
                                        backgroundColor: ["#4a5560", "#00B5D8", "#4a5560"],
                                        opacity: [0.4, 1, 0.4],
                                        scale: [0.85, 1.15, 0.85],
                                    }
                            }
                            transition={
                                reducedMotion
                                    ? undefined
                                    : { duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }
                            }
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default SurfLoader;
