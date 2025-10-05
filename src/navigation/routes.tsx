import HomePage from "../pages/Home/index.tsx";
import AboutPage from "../pages/About/index.tsx";
import ProjectsPage from "../pages/Projects/index.tsx";
import Loading from "../components/shared/Loading";
import { Book, BookOpen, Folder, Home, Sparkles } from "lucide-react";

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
    blog: {
        icon: BookOpen,
        name: "Blog",
        path: "https://blog.felipeteles.com",
        element: <HomePage />,
    },
};
