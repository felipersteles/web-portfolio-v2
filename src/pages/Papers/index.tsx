import { useEffect, useRef } from "react";
import { papers } from "../../data/papers";
import { motion } from "framer-motion";
import Potion from "../../components/features/Papers/Statue";

const PapersPage = () => {
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        let angle = 0;
        const speed = 0.001; // rotation speed

        const animate = () => {
            angle += speed;

            const items = carousel.children;
            const itemCount = items.length - 1; // exclude Potion
            const radius = 250;

            for (let i = 0; i < itemCount; i++) {
                const itemAngle =
                    angle + i * (360 / itemCount) * (Math.PI / 180);
                const x = radius * Math.cos(itemAngle);
                const y = radius * Math.sin(itemAngle);

                const element = items[i] as HTMLElement;
                element.style.transform = `translate(${x}px, ${y}px)`;
            }

            requestAnimationFrame(animate);
        };

        animate();
    }, []);

    return (
        <motion.div
            className="flex justify-center items-center min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
        >
            <div
                ref={carouselRef}
                className="relative w-[600px] h-[600px]"
                style={{ position: "relative" }}
            >
                {/* Orbiting Papers */}
                {papers.map((paper, index) => (
                    <motion.div
                        key={index}
                        className="absolute bg-white/20 p-4 rounded-lg shadow-lg text-center w-48"
                        style={{
                            top: "50%",
                            left: "50%",
                            transform: "translate(0px, 0px)",
                        }}
                    >
                        <h3 className="font-bold">{paper.title}</h3>
                        <p>
                            <a
                                href={paper.link}
                                className="text-blue-400 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                DOI: {paper.doi}
                            </a>
                        </p>
                    </motion.div>
                ))}

                {/* Center Potion */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                    }}
                >
                    <div className="w-64 h-64">
                        <Potion />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PapersPage;
