import { motion } from "framer-motion";

const ContactPage = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative w-full min-h-screen flex flex-col items-center justify-center"
        >
            {/* Heading */}
            <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">
                Get in Touch
            </h1>

            {/* Message */}
            <p className="text-center text-lg text-gray-700 max-w-2xl mb-6">
                I’m always open to connecting! You can reach me via email or
                through any of my social networks below. I’m available for
                collaborations, projects, and discussions.
            </p>

            {/* Email */}
            <p className="text-center text-indigo-600 font-medium mb-8">
                📧{" "}
                <a href="mailto:felipersteles@gmail.com">
                    felipersteles@gmail.com
                </a>
            </p>

            {/* Social Links */}
            <div className="flex justify-center gap-6">
                <a
                    href="https://www.linkedin.com/in/felipersteles"
                    target="_blank"
                    className="text-gray-800 hover:text-indigo-500 transition"
                >
                    LinkedIn
                </a>
                <a
                    href="https://github.com/felipersteles"
                    target="_blank"
                    className="text-gray-800 hover:text-indigo-500 transition"
                >
                    GitHub
                </a>
                <a
                    href="https://scholar.google.com.br/citations?user=CpPKPnkAAAAJ"
                    target="_blank"
                    className="text-gray-800 hover:text-indigo-500 transition"
                >
                    Google Scholar
                </a>
            </div>

            {/* Footer */}
            <footer className="mt-12 w-full text-center text-gray-600">
                <p>© 2025 Felipe Teles. All rights reserved.</p>
            </footer>
        </motion.div>
    );
};

export default ContactPage;
