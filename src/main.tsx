import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import HomePage from "./pages/Home/index.tsx";
import AboutPage from "./pages/About/index.tsx";
import ProjectsPage from "./pages/Projects/index.tsx";
import NotFoundPage from "./pages/NotFound/index.tsx";
import Loading from "./components/shared/Loading";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="*" element={<NotFoundPage />} />
                <Route path="/loading" element={<Loading />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
