import { Routes, Route } from "react-router-dom";
import { routes } from "./routes";

const Navigation = () => {
    return (
        <Routes>
            {Object.values(routes).map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
            ))}
        </Routes>
    );
};

export default Navigation;
