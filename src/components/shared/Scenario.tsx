import React from "react";
import SocialIcons from "./SocialIcons";
import { useMainStore } from "../../store";
import Loading from "./Loading";
import PowerButton from "./PowerButton";
import LogoComponent from "./Logo";
import { useNavigate } from "react-router-dom";
import ShipAndOcean from "./ShipAndOcean";
import ContactComponent from "./Contact";

interface ScenarioProps {
    children: React.ReactNode;
}

const Scenario = ({ children }: ScenarioProps) => {
    const {
        data: { storm, loadingProgress, isLoading, isRedirecting },
        fnOnChange,
    } = useMainStore();

    const navigate = useNavigate();

    const handleRedirect = () => {
        // Start the animation
        fnOnChange("isRedirecting", true);

        // Navigate after animation completes
        setTimeout(() => {
            fnOnChange("isRedirecting", false);
            navigate("/");
        }, 3000);
    };

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
                    className={`absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-8 transition-all duration-700 ${
                        storm ? "opacity-0" : "opacity-100"
                    }`}
                >
                    <PowerButton
                        isRedirecting={isRedirecting}
                        onClick={handleRedirect}
                    />

                    <LogoComponent isRedirecting={isRedirecting} theme="dark" />

                    <ContactComponent isRedirecting={isRedirecting} />
                </div>

                <div
                    className={`pointer-events-none absolute inset-0 transition-all duration-700 ${
                        storm ? "opacity-60 z-0" : "opacity-100 z-0"
                    }`}
                >
                    <ShipAndOcean
                        isRedirecting={isRedirecting}
                        storm={storm}
                        onLoad={handleShipLoaded}
                    />
                </div>

                {children}
                <SocialIcons isRedirecting={isRedirecting} storm={storm} />
            </div>
        </>
    );
};

export default Scenario;
