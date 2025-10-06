import { NavLink } from "react-router-dom";

export type LogoComponentParams = {
    theme: string;
    isRedirecting: boolean;
};

const LogoComponent = ({ theme, isRedirecting }: LogoComponentParams) => {
    const textColorClass = theme === "dark" ? "text-white" : "text-black";

    return (
        <NavLink
            className={`transition-all duration-700 ${
                isRedirecting ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            to="/"
        >
            <h1
                className={`fixed left-8 top-8 z-30 flex items-center ${textColorClass} text-5xl sm:text-4xl sm:left-4 sm:top-8`}
                style={{ fontFamily: '"Pacifico", cursive' }}
            >
                Teles
            </h1>
        </NavLink>
    );
};

export default LogoComponent;
