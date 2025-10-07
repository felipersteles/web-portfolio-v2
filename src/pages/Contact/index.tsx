import { motion } from "framer-motion";

const ContactPage = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center p-8"
        >
            <div className="max-w-4xl max-h-[80vh] overflow-y-auto bg-primary/50 backdrop-blur-md px-10 py-8 rounded-2xl shadow-2xl text-white text-lg leading-relaxed text-justify space-y-6">
                {/* Heading */}
                <h1 className="text-4xl font-bold mb-4 text-center">
                    Get in Touch
                </h1>

                {/* Message */}
                <p className="text-center max-w-2xl mx-auto">
                    I’m always open to connecting! You can reach me via email or
                    through any of my social networks below. I’m available for
                    collaborations, projects, and discussions.
                </p>

                {/* Email */}
                <p className="text-center text-indigo-300 font-medium">
                    📧{" "}
                    <a
                        href="mailto:felipersteles@gmail.com"
                        className="underline hover:text-indigo-100"
                    >
                        felipersteles@gmail.com
                    </a>
                </p>

                {/* Social Links */}
                <div className="flex justify-center gap-6">
                    <a
                        href="https://www.linkedin.com/in/felipersteles"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-300 transition"
                    >
                        LinkedIn
                    </a>
                    <a
                        href="https://github.com/felipersteles"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-300 transition"
                    >
                        GitHub
                    </a>
                    <a
                        href="https://scholar.google.com.br/citations?user=CpPKPnkAAAAJ"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-300 transition"
                    >
                        Google Scholar
                    </a>
                </div>

                {/* Code Link */}
                <div className="text-center">
                    All the code of this website is available{" "}
                    <a
                        href="https://github.com/felipersteles/web-portfolio-v2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-indigo-300 hover:text-indigo-100"
                    >
                        here
                    </a>.
                </div>

                {/* Footer */}
                <footer className="mt-12 w-full text-center text-gray-300">
                    <p>© 2025 Felipe Teles. All rights reserved.</p>
                </footer>
            </div>
        </motion.div>
    );
};

export default ContactPage;
