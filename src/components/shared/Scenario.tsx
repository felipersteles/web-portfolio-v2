import React from "react";
import Ship from "../features/Home/Ship";
import SocialIcons from "./SocialIcons";
import { useMainStore } from "../../store";
import Loading from "./Loading";

interface ScenarioProps {
    children: React.ReactNode;
}

const Scenario = ({ children }: ScenarioProps) => {
    const {
        data: { storm, loadingProgress, isLoading, isRedirecting },
        fnOnChange,
    } = useMainStore();

    const handleShipLoaded = () => {
        // Garante que o progresso vá a 100%
        fnOnChange("loadingProgress", 100);

        // Aguarda 2 segundos antes de esconder o loading
        setTimeout(() => {
            fnOnChange("isLoading", false);
        }, 2000);
    };

    return (
        <>
            {isLoading && (
                <div className="fixed inset-0 z-50 transition-opacity duration-700 opacity-100 animate-fade-out">
                    <Loading progress={loadingProgress} />
                </div>
            )}

            <div
                className={`relative h-screen w-screen overflow-hidden text-[var(--color-text)] transition-colors duration-500`}
                style={{
                    background: `linear-gradient(145deg, var(--color-primary), var(--color-body))`,
                }}
            >
                <div
                    className={`pointer-events-none absolute inset-0 transition-all duration-700 ${
                        storm ? "opacity-60 z-0" : "opacity-100 z-0"
                    }`}
                >
                    <Ship
                        isRedirecting={isRedirecting}
                        storm={storm}
                        onLoad={handleShipLoaded}
                    />
                </div>

                {children}
                <SocialIcons storm={storm} />
            </div>
        </>
    );
};

export default Scenario;
