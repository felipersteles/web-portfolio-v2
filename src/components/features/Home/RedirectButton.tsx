import React from "react";
import { useNavigate } from "react-router-dom";
import { useMainStore } from "../../../store";

interface RedirectButtonProps {
    icon?: React.ReactNode;
    text?: string;
    path: string; // Path to redirect to
    className?: string;
    textColor?: string;
    hoverTextColor?: string;
    delay?: number; // Delay before actual navigation
    isOut?: boolean;
}

const RedirectButton: React.FC<RedirectButtonProps> = ({
    icon,
    text = "Redirect",
    path,
    className = "",
    textColor = "text-white",
    hoverTextColor = "text-black",
    isOut = false,
    delay = 3000, // Default 3 seconds delay for animation
}) => {
    const navigate = useNavigate();
    const {
        data: { isRedirecting },
        fnOnChange,
    } = useMainStore();

    const handleRedirect = () => {
        // Start the animation
        fnOnChange("isRedirecting", true);

        // Navigate after animation completes
        setTimeout(() => {
            fnOnChange("isRedirecting", false);

            if (isOut) {
                // Open in a new tab/window
                window.open(path, "_blank", "noopener,noreferrer");
            } else {
                // Internal navigation
                navigate(path);
            }
        }, delay);
    };

    const baseClasses =
        "px-6 py-2 bg-transparent border-2 border-current rounded-lg transition-all duration-300 font-semibold text-sm sm:text-base hover:bg-white hover:bg-opacity-90 transform hover:scale-105 active:scale-95 flex items-center gap-2";

    return (
        <button
            onClick={handleRedirect}
            className={`${baseClasses} ${textColor} hover:${hoverTextColor} ${className}`}
            disabled={isRedirecting}
        >
            {icon}
            {isRedirecting ? "✨ Casting.." : text}
        </button>
    );
};

export default RedirectButton;
