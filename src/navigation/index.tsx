import { Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import NotFoundPage from "../pages/NotFound";

const Navigation = () => {
    return (
        <Routes>
            {Object.values(routes).map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default Navigation;
