import { useState, useEffect, useCallback } from "react";
import { darkColors, lightColors } from "./theme";
import SurfLoader from "./components/SurfLoader";
import NavBar from "./components/sections/NavBar";
import HeroSection from "./components/sections/HeroSection";
import ProjectsSection from "./components/sections/ProjectsSection";
import StatsSection from "./components/sections/StatsSection";
import PapersSection from "./components/sections/PapersSection";
import AboutSection from "./components/sections/AboutSection";
import TreasureSection from "./components/sections/TreasureSection";
import ContactModal from "./components/sections/ContactModal";
import OceanScene from "./components/features/Home/OceanScene";

const App = () => {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [filter, setFilter] = useState<"featured" | "all">("featured");
    const [contactOpen, setContactOpen] = useState(false);
    // appLoading -> SurfLoader keeps looping, globe stays hidden below the fold
    // revealed   -> SurfLoader has finished its exit fade, page content slides/fades in
    const [appLoading, setAppLoading] = useState(true);
    const [revealed, setRevealed] = useState(false);

    // The ocean scene reports when its models are in; the timer is a safety net for slow networks
    const onSceneReady = useCallback(() => setAppLoading(false), []);
    useEffect(() => {
        const timer = setTimeout(() => setAppLoading(false), 8000);
        return () => clearTimeout(timer);
    }, []);

    const c = theme === "dark" ? darkColors : lightColors;

    // Sync body background + CSS accent variable with theme
    useEffect(() => {
        document.body.style.background = theme === "dark" ? "#040814" : "#f5f2ed";
        document.body.style.transition = "background 0.3s";
        document.documentElement.style.setProperty("--accent", c.accent);
    }, [theme, c.accent]);

    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: c.text,
            position: "relative",
            transition: "color .3s",
        }}>
            <OceanScene theme={theme} revealed={!appLoading} onReady={onSceneReady} />

            {/* All content sits at z-index 1, above the fixed canvas (z-index 0) */}
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    transform: revealed ? "translateY(0)" : "translateY(48px)",
                    opacity: revealed ? 1 : 0,
                    transition: "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
                }}
            >
                <NavBar
                    c={c}
                    theme={theme}
                    onToggleTheme={() => setTheme((t) => t === "dark" ? "light" : "dark")}
                    onOpenContact={() => setContactOpen(true)}
                />
                <HeroSection c={c} />
                <ProjectsSection c={c} filter={filter} onFilterChange={setFilter} />
                <StatsSection c={c} />
                <PapersSection c={c} />
                <AboutSection c={c} />
                <TreasureSection onOpenContact={() => setContactOpen(true)} />
            </div>

            {/* Film grain overlay — adds cinematic texture over the full page */}
            <div aria-hidden="true" className="grain-overlay" />

            {contactOpen && <ContactModal c={c} theme={theme} onClose={() => setContactOpen(false)} />}

            <SurfLoader isLoading={appLoading} onExited={() => setRevealed(true)} />
        </div>
    );
};

export default App;
