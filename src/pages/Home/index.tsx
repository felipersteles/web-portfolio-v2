import { useState } from "react";
import { motion } from "framer-motion";
import Earth from "../../components/features/Home/Earth";
import { Presentation } from "../../components/features/Home/Presentation";
import { useMainStore } from "../../store";
import RedirectButton from "../../components/features/Home/RedirectButton";
import { routes } from "../../navigation/routes";

const HomePage = () => {
    const [openPresentation, setOpenPresentation] = useState<boolean>(false);
    const { fnOnChange } = useMainStore();

    const togglePresentation = () => {
        const toggleOpen = !openPresentation;
        setOpenPresentation(toggleOpen);
        fnOnChange("storm", toggleOpen);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative w-full h-full"
        >
            {/* Dark part overlay */}
            <div
                className={`pointer-events-none absolute bottom-0 right-1/2 top-0 z-10 bg-black transition-all duration-700 ease-in-out sm:right-0 ${
                    openPresentation
                        ? "h-full w-1/2 sm:h-1/2 sm:w-full opacity-70"
                        : "h-0 w-0 opacity-0"
                }`}
            ></div>

            {/* Center icon button */}
            <button
                onClick={togglePresentation}
                className={`absolute z-20 flex transform flex-col items-center justify-center transition-all duration-700 ${
                    openPresentation
                        ? "left-auto right-4 bottom-4 sm:right-8 sm:bottom-8"
                        : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                }`}
                aria-label="Center action"
            >
                <div
                    className={`transition-all duration-700 ${
                        openPresentation ? "w-32 h-32" : "w-64 h-64"
                    }`}
                >
                    <Earth />
                </div>

                {!openPresentation && (
                    <span className="mt-4 font-semibold text-center text-white">
                        Click the Earth!
                    </span>
                )}
            </button>

            {/* Right side redirect */}
            <div
                className={`absolute -right-6 top-1/2 z-20 -translate-y-1/2 rotate-90 transition-all duration-700 ${
                    openPresentation
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100"
                }`}
            >
                <RedirectButton
                    text={routes.publications.name}
                    path={routes.publications.path}
                    className="border-purple-600 hover:border-purple-300"
                    textColor="text-purple-800"
                    hoverTextColor="text-purple-800"
                />
            </div>

            {/* Left side redirect */}
            <div
                className={`absolute left-8 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 -rotate-90 transition-all duration-700 ${
                    openPresentation
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100"
                }`}
            >
                <RedirectButton
                    text={routes.projects.name}
                    path={routes.projects.path}
                    className="border-blue-400 hover:border-blue-300"
                    textColor="text-blue-300"
                    hoverTextColor="text-blue-800"
                />
            </div>

            {/* Bottom bar redirects */}
            <div
                className={`absolute bottom-8 left-0 right-0 z-20 flex w-full justify-evenly transition-all duration-700 ${
                    openPresentation
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100"
                }`}
            >
                <RedirectButton
                    text={routes.about.name}
                    path={routes.about.path}
                    className="border-green-400 hover:border-green-300"
                    textColor="text-green-300"
                    hoverTextColor="text-green-800"
                />
                <RedirectButton
                    text={routes.stats.name}
                    path={routes.stats.path}
                    className="border-yellow-400 hover:border-yellow-300"
                    textColor="text-yellow-300"
                    hoverTextColor="text-yellow-800"
                />
            </div>

            {/* Presentation overlay */}
            {openPresentation && <Presentation onClose={togglePresentation} />}
        </motion.div>
    );
};

export default HomePage;
