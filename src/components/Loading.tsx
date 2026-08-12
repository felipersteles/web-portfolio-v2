import { mono } from "../theme";

interface LoadingProps {
    exiting?: boolean;
}

const Loading = ({ exiting = false }: LoadingProps) => {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "18px",
                background: "#000000",
                color: "#c9a463",
                // Exit mirrors the loader's own chevrons: one last snap upward and gone
                transform: exiting ? "translateY(-100%)" : "translateY(0)",
                transition: "transform 0.7s cubic-bezier(0.6, 0, 0.15, 1)",
            }}
        >
            <div className="loader" />
            <span style={{ fontFamily: mono, fontSize: "13px", letterSpacing: "3px" }}>
                LOADING
            </span>
        </div>
    );
};

export default Loading;
