import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Scenario from "./components/shared/Scenario.tsx";
import Navigation from "./navigation/index.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Scenario>
            <Navigation />
        </Scenario>
    </StrictMode>
);
