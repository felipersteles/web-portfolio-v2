import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFoundPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => navigate("/"), 4000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <motion.div
            className="relative z-[5] w-full h-screen flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="bg-text/85 backdrop-blur-md rounded-[0_30px_0_30px] border border-body/20 shadow-xl px-12 py-10 flex flex-col items-center gap-4 text-center">
                <h1 className="text-7xl font-bold text-body">404</h1>
                <p className="text-body/60 text-sm">Page not found. Redirecting to home...</p>
                <div className="w-48 h-1 bg-body/10 rounded-full overflow-hidden mt-2">
                    <motion.div
                        className="h-full bg-body/50 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4, ease: "linear" }}
                    />
                </div>
                <button
                    onClick={() => navigate("/")}
                    className="mt-2 text-xs text-body/40 hover:text-body/70 transition-colors cursor-pointer underline underline-offset-2"
                >
                    Go now
                </button>
            </div>
        </motion.div>
    );
};

export default NotFoundPage;
