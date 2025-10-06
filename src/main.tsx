import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Scenario from "./components/shared/Scenario.tsx";
import Navigation from "./navigation/index.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Scenario>
                <Navigation />
            </Scenario>
        </BrowserRouter>
    </StrictMode>
);
