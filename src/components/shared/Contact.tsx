import { NavLink } from "react-router-dom";

const ContactComponent = ({ isRedirecting }: { isRedirecting: boolean }) => {
    return (
        <NavLink
            className={`transition-all duration-700 ${
                isRedirecting ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            to="/contact"
        >
            <button
                className="
                    fixed right-8 top-8 z-30
                    bg-gradient-to-r from-secondary to-primary
                    text-white font-semibold
                    px-6 py-3 rounded-full shadow-lg
                    hover:scale-105 hover:shadow-xl
                    transition transform duration-300
                    flex items-center gap-2
                    text-lg sm:px-4 sm:py-2 sm:text-sm sm:right-4 sm:top-6
                "
            >
                Contact Me
            </button>
        </NavLink>
    );
};

export default ContactComponent;
