import { useEffect, useRef, useState } from "react";
import { projects } from "../../../data/projects";
import ProjectCard from "./ProjectCard";
import { Globe, PauseCircle, PlayCircle } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useMainStore } from "../../../store";

const ProjectList: React.FC = () => {
    const controls = useAnimation();
    const [isPaused, setIsPaused] = useState(false);
    const [currentX, setCurrentX] = useState(0);
    const [initialOffset, setInitialOffset] = useState(0); // 👈 new
    const yinyang = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null); // 👈 reference to ul
    const animationStart = useRef<number | null>(null);

    const { fnOnChange } = useMainStore();

    // Compute initial center offset
    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        const listWidth = list.scrollWidth;
        const viewportWidth = window.innerWidth;

        // Center the middle of the duplicated list
        const offset = -(listWidth / 2 - viewportWidth / 2);
        setInitialOffset(offset);
        setCurrentX(offset);
    }, []);

    // Handle spacebar press
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                togglePause();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isPaused]);

    // Start or pause animation
    useEffect(() => {
        let animationFrame: number;

        const animate = (time: number) => {
            if (animationStart.current === null) animationStart.current = time;

            const elapsed = time - animationStart.current;
            const speed = 0.05;
            const distance = (elapsed * speed) % window.innerWidth;

            if (!isPaused) {
                const newX = initialOffset - distance;
                setCurrentX(newX);
                controls.set({ x: `${newX}px` });
                animationFrame = requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(animationFrame);
                animationStart.current = time - elapsed;
            }
        };

        if (!isPaused) {
            animationFrame = requestAnimationFrame(animate);
        }

        fnOnChange("storm", isPaused);

        return () => cancelAnimationFrame(animationFrame);
    }, [isPaused, controls, fnOnChange, initialOffset]);

    const togglePause = () => {
        setIsPaused((prev) => !prev);
    };

    return (
        <motion.div
            className="relative w-full overflow-hidden py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1 } }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
            {/* Carousel */}
            <div className="relative w-full overflow-hidden">
                <motion.ul
                    ref={listRef} // 👈 attach ref
                    animate={controls}
                    className="flex gap-8 min-w-max"
                    style={{ x: currentX }}
                >
                    {[...projects, ...projects].map((project, idx) => (
                        <ProjectCard key={`${project.id}-${idx}`} project={project} />
                    ))}
                </motion.ul>
            </div>

            {/* Pause/Play Button */}
            <button
                onClick={togglePause}
                className="fixed right-4 top-28 z-20 bg-neutral-900/70 hover:bg-neutral-800 
                           text-white p-3 rounded-full transition flex gap-2"
            >
                {isPaused ? "Play" : "Pause"}
                <span>
                    {isPaused ? (
                        <PlayCircle className="w-6 h-6" />
                    ) : (
                        <PauseCircle className="w-6 h-6" />
                    )}
                </span>
            </button>

            {/* Rotating Globe */}
            <motion.div
                ref={yinyang}
                animate={{
                    rotate: isPaused ? 0 : [0, 360],
                }}
                transition={{
                    repeat: isPaused ? 0 : Infinity,
                    ease: "linear",
                    duration: 20,
                }}
                className="fixed right-4 bottom-4 w-20 h-20 z-10
                           lg:w-16 lg:h-16 md:w-12 md:h-12 sm:w-10 sm:h-10"
            >
                <Globe className="w-full h-full text-text" />
            </motion.div>
        </motion.div>
    );
};

export default ProjectList;
