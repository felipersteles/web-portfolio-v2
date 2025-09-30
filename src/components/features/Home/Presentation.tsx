import { useEffect, useState } from "react";
import profileImg from "../../../assets/imgs/profile-img.png";

interface PresentationProps {
    onClose: () => void;
}

const PresentationHeader = "Hello! I'm";
const PresentationText =
    "Sênior Software Developer. I love art and computers. You can see more about me in this website.";

export const Presentation = ({ onClose }: PresentationProps) => {
    const [height, setHeight] = useState("h-[55vh]");
    const [animateOpen, setAnimateOpen] = useState(false);

    useEffect(() => {
        const updateHeight = () => {
            if (window.matchMedia("(max-width: 20em)").matches) {
                setHeight("h-[60vh]");
            } else if (window.matchMedia("(max-width: 50em)").matches) {
                setHeight("h-[70vh]");
            } else {
                setHeight("h-[55vh]");
            }
        };

        updateHeight();
        window.addEventListener("resize", updateHeight);

        setTimeout(() => setAnimateOpen(true), 100);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", updateHeight);
        };
    }, [onClose]);

    return (
        <div
            className={`z-30 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                  flex flex-col md:flex-row 
                  w-[90vw] sm:w-[80vw] md:w-[65vw] lg:w-[50vw] ${height} 
                  bg-gradient-to-r from-[var(--color-body)] to-[var(--color-primary)] 
                  border-l-2 border-[var(--color-body)] 
                  border-r-2 border-[var(--color-primary)] 
                  rounded-lg overflow-hidden
                  transition-all duration-500 ease-in-out
                  ${animateOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute cursor-pointer hover:bg-gray-200/10 z-50 top-4 right-4 text-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition"
                aria-label="Close Presentation"
            >
                ✕
            </button>

            {/* Left side text */}
            <div className="w-full md:w-1/2 flex flex-col justify-evenly p-6 sm:p-8">
                <h2 className="text-[var(--color-accent)] text-lg sm:text-xl md:text-2xl animate-fade-in">
                    {PresentationHeader}
                </h2>
                <h1 className="text-[var(--color-primary)] text-2xl sm:text-3xl md:text-4xl font-bold italic animate-fade-in delay-200">
                    Felipe Teles.
                </h1>
                <p className="text-[var(--color-text)] text-sm sm:text-base md:text-lg animate-fade-in delay-400">
                    {PresentationText}
                </p>
            </div>

            {/* Right side image */}
            <div className="w-full md:w-1/2 relative flex justify-center items-center p-4">
                <img
                    src={profileImg}
                    alt="Profile Pic"
                    className="w-3/4 sm:w-2/3 md:w-full h-auto transform transition-transform duration-300 hover:scale-110 object-cover rounded-lg"
                />
            </div>
        </div>
    );
};
