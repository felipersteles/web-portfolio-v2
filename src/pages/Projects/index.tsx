import { motion } from "framer-motion";
import ProjectList from "../../components/features/Projects/ProjectList";

const ProjectsPage = () => {
    return (
        <motion.div
            className="relative z-[5] w-full h-screen flex items-start justify-center pt-24 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="w-full h-full overflow-y-auto pb-10 px-1">
                <ProjectList />
            </div>
        </motion.div>
    );
};

export default ProjectsPage;
