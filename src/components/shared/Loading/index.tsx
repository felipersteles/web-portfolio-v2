import "./style.css";

interface LoadingProps {
    progress?: number; // Make progress optional
}

const Loading = ({ progress = 0 }: LoadingProps) => {
    return (
        <div
            className="w-screen h-screen flex flex-col items-center justify-center gap-8"
            style={{
                background: `linear-gradient(145deg, var(--color-primary), var(--color-body))`,
            }}
        >
            {/* Animated Earth-like loader */}
            <div className="relative">
                <div className="earth-loader w-32 h-32">
                    <div className="earth-spinner"></div>
                    <div className="orbit"></div>
                </div>
            </div>

            {/* Loading text with animation */}
            <div className="loading-text text-center">
                <div className="loading-words mb-4">
                    Loading Universe
                </div>
                
                {/* Progress bar */}
                <div className="progress-container w-64 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                        className="progress-bar h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                
                {/* Progress percentage */}
                <div className="progress-text mt-3 text-sm font-medium text-gray-700">
                    {progress > 0 ? `${Math.round(progress)}%` : 'Initializing...'}
                </div>
            </div>
        </div>
    );
};

export default Loading;