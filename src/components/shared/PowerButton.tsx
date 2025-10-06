import { Fan } from "lucide-react";

type PowerButtonParams = {
    isRedirecting: boolean;
    onClick?: () => void;
};

const PowerButton = ({ onClick, isRedirecting }: PowerButtonParams) => {
    return (
        <button
            onClick={onClick}
            className="cursor-pointer fixed left-1/2 top-8 z-30 h-10 w-10 -translate-x-1/2 transform rounded-full border border-black bg-[#fcf6f4] shadow transition hover:bg-transparent hover:shadow-[0_0_8px_6px_rgba(34,0,80,0.2)] sm:h-8 sm:w-8"
            aria-label="Power"
        >
            <div className="flex text-black h-full w-full items-center justify-center">
                <Fan className={`${isRedirecting && 'animate-spin animate-pulse'}`}/>
            </div>
        </button>
    );
};

export default PowerButton;
