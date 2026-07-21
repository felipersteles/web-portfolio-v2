import { useState } from "react";
import { darkColors, lightColors } from "./theme";
import NavBar from "./components/sections/NavBar";
import HeroSection from "./components/sections/HeroSection";
import ProjectsSection from "./components/sections/ProjectsSection";
import StatsSection from "./components/sections/StatsSection";
import PapersSection from "./components/sections/PapersSection";
import AboutSection from "./components/sections/AboutSection";
import FooterSection from "./components/sections/FooterSection";
import ContactModal from "./components/sections/ContactModal";

const App = () => {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [filter, setFilter] = useState<"featured" | "all">("featured");
    const [contactOpen, setContactOpen] = useState(false);

    const c = theme === "dark" ? darkColors : lightColors;

    return (
        <div style={{
            fontFamily: "'Manrope', sans-serif",
            background: c.bg,
            color: c.text,
            minHeight: "100vh",
            transition: "background .3s, color .3s",
        }}>
            <NavBar c={c} theme={theme} onToggleTheme={() => setTheme((t) => t === "dark" ? "light" : "dark")} onOpenContact={() => setContactOpen(true)} />
            <HeroSection c={c} theme={theme} />
            <ProjectsSection c={c} filter={filter} onFilterChange={setFilter} />
            <StatsSection c={c} />
            <PapersSection c={c} />
            <AboutSection c={c} />
            <FooterSection c={c} />
            {contactOpen && <ContactModal c={c} theme={theme} onClose={() => setContactOpen(false)} />}
        </div>
    );
};

export default App;
