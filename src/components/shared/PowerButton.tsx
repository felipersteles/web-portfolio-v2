import { NavLink } from "react-router-dom";

type PowerButtonParams = {
    onClick?: () => void;
};

const PowerButton = ({ onClick }: PowerButtonParams) => {
    return (
        <button
            onClick={onClick}
            className="fixed left-1/2 top-8 z-30 h-10 w-10 -translate-x-1/2 transform rounded-full border border-black bg-[#fcf6f4] p-[0.3rem] shadow transition hover:bg-[rgba(34,0,80,0.8)] hover:shadow-[0_0_8px_6px_rgba(34,0,80,0.2)] sm:h-8 sm:w-8"
            aria-label="Power"
        >
            <NavLink to="/" className="flex h-full w-full items-center justify-center">
                <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-black sm:h-5 sm:w-5"
                >
                    <path
                        d="M12 2v10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M6.3 7.3a7 7 0 1 0 11.4 0"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </NavLink>
        </button>
    );
};

export default PowerButton;


