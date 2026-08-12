import { useState, useEffect } from "react";
import { darkColors, lightColors } from "./theme";
import Loading from "./components/Loading";
import NavBar from "./components/sections/NavBar";
import HeroSection from "./components/sections/HeroSection";
import ProjectsSection from "./components/sections/ProjectsSection";
import StatsSection from "./components/sections/StatsSection";
import PapersSection from "./components/sections/PapersSection";
import AboutSection from "./components/sections/AboutSection";
import FooterSection from "./components/sections/FooterSection";
import ContactModal from "./components/sections/ContactModal";
import PortfolioScene from "./components/features/Home/PortfolioScene";

const App = () => {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [filter, setFilter] = useState<"featured" | "all">("featured");
    const [contactOpen, setContactOpen] = useState(false);
    // loading  -> overlay covers screen, globe stays hidden below the fold
    // exiting  -> overlay snaps upward and off (like the loader's chevrons), globe starts rising
    // revealed -> overlay unmounted, page content slides/fades in
    const [phase, setPhase] = useState<"loading" | "exiting" | "revealed">("loading");
    const LOADING_EXIT_MS = 700;

    // Placeholder timer — will be replaced by the real 3D model load signal
    useEffect(() => {
        const timer = setTimeout(() => setPhase("exiting"), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (phase !== "exiting") return;
        const timer = setTimeout(() => setPhase("revealed"), LOADING_EXIT_MS);
        return () => clearTimeout(timer);
    }, [phase]);

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
            <PortfolioScene theme={theme} revealed={phase !== "loading"} />

            {/* All content sits at z-index 1, above the fixed canvas (z-index 0) */}
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    transform: phase === "revealed" ? "translateY(0)" : "translateY(48px)",
                    opacity: phase === "revealed" ? 1 : 0,
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
                <FooterSection c={c} />
            </div>

            {/* Film grain overlay — adds cinematic texture over the full page */}
            <div aria-hidden="true" className="grain-overlay" />

            {contactOpen && <ContactModal c={c} theme={theme} onClose={() => setContactOpen(false)} />}

            {phase !== "revealed" && <Loading exiting={phase === "exiting"} />}
        </div>
    );
};

export default App;
