import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import PowerButton from "../../components/shared/PowerButton";
import Ship from "../../components/features/Home/Ship";
import Earth from "../../components/features/Home/Earth";
import LogoComponent from "../../components/shared/Logo";
import { Presentation } from "../../components/features/Home/Presentation";
import SocialIcons from "../../components/shared/SocialIcons";

const HomePage = () => {
    const [openPresentation, setOpenPresentation] = useState<boolean>(false);
    const [mobile, setMobile] = useState<boolean>(false);
    const [path, setPath] = useState<string>("");

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 50em)");
        setMobile(mq.matches);
        const listener = (e: MediaQueryListEvent) => setMobile(e.matches);
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
    }, []);

    const exitTransform = useMemo(() => {
        if (path === "about" || path === "skills") return "-translate-y-full";
        return path === "work" ? "translate-x-full" : "-translate-x-full";
    }, [path]);

    const onClickPowerButton = () => {
        if (openPresentation) setOpenPresentation(false);
    };

    return (
        <>
            <div
                className={`relative h-screen w-screen overflow-hidden text-[var(--color-text)] transition-colors duration-500`}
                style={{
                    background: `linear-gradient(145deg, var(--color-primary), var(--color-body))`,
                }}
            >
                {/* Top bar */}
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

                {/* Ship background - INCREASED OPACITY AND Z-INDEX */}
                <div
                    className={`pointer-events-none absolute inset-0 transition-all duration-700 ${
                        openPresentation ? "opacity-60 z-0" : "opacity-100 z-0"
                    }`}
                >
                    <Ship presentationIsOpen={openPresentation} />
                </div>

                {/* Center icon button - FIXED POSITIONING */}
                <button
                    onClick={() => setOpenPresentation((v) => !v)}
                    className={`absolute z-20 flex transform flex-col items-center justify-center transition-all duration-700 ${
                        openPresentation
                            ? "left-auto right-4 bottom-4 sm:right-8 sm:bottom-8" // Fixed position in bottom right
                            : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" // Centered
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
                        <span className="mt-4 font-semibold text-center">
                            Click in the Earth!
                        </span>
                    )}
                </button>

                {/* Right vertical link (Snake/Certificates) */}
                <NavLink
                    to={mobile ? "/certificates" : "/snake"}
                    onClick={() => setPath(mobile ? "certificates" : "snake")}
                    className={`absolute right-1 top-1/2 z-20 -translate-y-1/2 rotate-90 text-black sm:right-1 transition-all duration-700 ${
                        openPresentation
                            ? "opacity-0 pointer-events-none"
                            : "opacity-100"
                    }`}
                >
                    <h2 className="transition-transform duration-200 hover:scale-110 active:scale-95">
                        {mobile ? "Certificates" : "Play Snake"}
                    </h2>
                </NavLink>

                {/* Left vertical link (Projects) */}
                <NavLink
                    to="/projects"
                    onClick={() => setPath("projects")}
                    className={`absolute left-8 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 -rotate-90 no-underline transition-all duration-700 ${
                        openPresentation
                            ? "opacity-0 pointer-events-none"
                            : "opacity-100"
                    }`}
                >
                    <h2 className="transition-transform duration-200 hover:scale-110 active:scale-95">
                        Projects
                    </h2>
                </NavLink>

                {/* Bottom bar */}
                <div
                    className={`absolute bottom-4 left-0 right-0 z-20 flex w-full justify-evenly transition-all duration-700 ${
                        openPresentation
                            ? "opacity-0 pointer-events-none"
                            : "opacity-100"
                    }`}
                >
                    <NavLink
                        to="/about"
                        onClick={() => setPath("about")}
                        className="text-[var(--color-text)]"
                    >
                        <h2 className="transition-transform duration-200 hover:scale-110 active:scale-95">
                            About me.
                        </h2>
                    </NavLink>

                    <a
                        href="https://blog.felipeteles.com"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setPath("skills")}
                    >
                        <h2 className="transition-transform duration-200 hover:scale-110 active:scale-95">
                            My blog.
                        </h2>
                    </a>
                </div>

                {/* Simple transition indicator for route exit direction (no animation lib) */}
                <div
                    className={`pointer-events-none absolute inset-0 -z-10 transform ${exitTransform}`}
                />
            </div>

            <SocialIcons presentationOpen={openPresentation} />
            {/* Presentation overlay */}
            {openPresentation && (
                <Presentation onClose={() => setOpenPresentation(false)} />
            )}
        </>
    );
};

export default HomePage;
