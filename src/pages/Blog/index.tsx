import { motion } from "framer-motion";

const BlogPage = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center p-8"
        >
            <div className="max-w-4xl bg-yellow-500/50 backdrop-blur-md px-10 py-8 rounded-2xl shadow-2xl text-white text-lg leading-relaxed text-center space-y-6">
                {/* Heading */}
                <h1 className="text-4xl font-bold mb-4">
                    🚧 Blog Redirect Notice
                </h1>

                <p>
                    You will be redirected to the blog homepage where you can explore the content.  
                    This page is under maintenance, but the blog is live and ready to explore.
                </p>

                {/* Button Redirect Link */}
                <div className="flex justify-center">
                    <a
                        href="https://blog.felipeteles.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
                    >
                        Visit My Blog
                    </a>
                </div>

                {/* Footer */}
                <footer className="mt-8 w-full text-center text-white/80">
                    <p>© 2025 Felipe Teles. All rights reserved.</p>
                </footer>
            </div>
        </motion.div>
    );
};

export default BlogPage;
