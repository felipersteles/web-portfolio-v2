import HomePage from "../pages/Home/index.tsx";
import AboutPage from "../pages/About/index.tsx";
import ProjectsPage from "../pages/Projects/index.tsx";
import Loading from "../components/shared/Loading";
import { Book, BarChart2, FlaskConical, Folder, Home, Phone, Sparkles } from "lucide-react";
import PapersPage from "../pages/Papers/index.tsx";
import ContactPage from "../pages/Contact/index.tsx";
import StatsPage from "../pages/Stats/index.tsx";

export const routes = {
    main: {
        icon: Home,
        name: "Home Page",
        path: "/",
        element: <HomePage />,
    },
    about: {
        icon: Book,
        name: "About",
        path: "/about",
        element: <AboutPage />,
    },
    projects: {
        icon: Folder,
        name: "Projects",
        path: "/projects",
        element: <ProjectsPage />,
    },
    loading: {
        icon: Sparkles,
        name: "Loading",
        path: "/loading",
        element: <Loading />,
    },
    stats: {
        icon: BarChart2,
        name: "Stats",
        path: "/stats",
        element: <StatsPage />,
    },
    publications: {
        icon: FlaskConical,
        name: "My Papers",
        path: "/papers",
        element: <PapersPage />,
    },
    contact: {
        icon: Phone,
        name: "Contact Me",
        path: "/contact",
        element: <ContactPage />,
    }
};
