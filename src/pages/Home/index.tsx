import { useState } from "react";
import PowerButton from "../../components/shared/PowerButton";
import Earth from "../../components/features/Home/Earth";
import LogoComponent from "../../components/shared/Logo";
import { Presentation } from "../../components/features/Home/Presentation";
import { useMainStore } from "../../store";
import RedirectButton from "./RedirectButton";
import { routes } from "../../navigation/routes";

const HomePage = () => {
    const [openPresentation, setOpenPresentation] = useState<boolean>(false);

    const { fnOnChange } = useMainStore();

    const onClickPowerButton = () => {
        if (openPresentation) setOpenPresentation(false);
    };

    const togglePresentation = () => {
        const toggleOpen = !openPresentation;
        setOpenPresentation(toggleOpen);
        fnOnChange("storm", toggleOpen);
    };

    return (
        <>
            <div
                className={`pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-8 transition-all duration-700 ${
                    openPresentation ? "opacity-0" : "opacity-100"
                }`}
            >
                <PowerButton onClick={onClickPowerButton} />

                <LogoComponent theme="dark" />
            </div>

            {/* Dark part overlay - REDUCED Z-INDEX */}
            <div
                className={`pointer-events-none absolute bottom-0 right-1/2 top-0 z-10 bg-black transition-all duration-700 ease-in-out sm:right-0 ${
                    openPresentation
                        ? "h-full w-1/2 sm:h-1/2 sm:w-full opacity-70"
                        : "h-0 w-0 opacity-0"
                }`}
            ></div>

            {/* Center icon button - FIXED POSITIONING */}
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

            {/* Right side - Redirect Button */}
            <div
                className={`absolute -right-14 top-1/2 z-20 -translate-y-1/2 rotate-90 transition-all duration-700 ${
                    openPresentation
                        ? "opacity-0 pointer-events-none"
                        : "opacity-100"
                }`}
            >
                <RedirectButton
                    text={routes.projects.name}
                    path={routes.projects.path}
                    className="border-purple-400 hover:border-purple-300"
                    textColor="text-purple-300"
                    hoverTextColor="text-purple-800"
                />
            </div>

            {/* Left side - Redirect Button */}
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

            {/* Bottom bar - Two Redirect Buttons */}
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
                    text={routes.blog.name}
                    path={routes.blog.path}
                    className="border-yellow-400 hover:border-yellow-300"
                    textColor="text-yellow-300"
                    hoverTextColor="text-yellow-800"
                />
            </div>

            {/* Presentation overlay */}
            {openPresentation && <Presentation onClose={togglePresentation} />}
        </>
    );
};

export default HomePage;
