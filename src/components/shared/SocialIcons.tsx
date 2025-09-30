import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "../../assets/icons";

interface SocialIconsProps {
    presentationOpen: boolean;
}

const SocialIcons = ({
    presentationOpen,
}: SocialIconsProps): React.ReactNode => {
    const [mq, setMq] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 40em)");
        setMq(mediaQuery.matches);

        const handleResize = (e: MediaQueryListEvent) => setMq(e.matches);
        mediaQuery.addEventListener("change", handleResize);

        return () => mediaQuery.removeEventListener("change", handleResize);
    }, []);

    const icons = [
        {
            href: "https://github.com/felipersteles",
            Icon: Github,
        },
        {
            href: "https://www.linkedin.com/in/felipersteles/",
            Icon: Linkedin,
        },
        {
            href: "https://x.com/felipsteles",
            Icon: Twitter,
        },
    ];

    return (
        <div
            className={`fixed bottom-0 left-8 z-[9999] flex flex-col items-center sm:left-4 transition-all duration-700 ${
                presentationOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        >
            {icons.map(({ href, Icon }, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: index * 0.1 }}
                    className="my-2"
                >
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href={href}
                        className="cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
                    >
                        <Icon width={25} height={25} color="white" />
                    </a>
                </motion.div>
            ))}

            {/* Animated Line */}
            <motion.div
                className="w-[2px] mt-2 bg-white transition-all duration-700"
                animate={{
                    height: mq ? "4rem" : "6rem",
                    opacity: presentationOpen ? 0 : 1,
                }}
            />
        </div>
    );
};

export default SocialIcons;
