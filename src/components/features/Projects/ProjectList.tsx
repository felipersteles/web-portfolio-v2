import { projects } from "../../../data/projects";
import ProjectCard from "./ProjectCard";
import { motion } from "framer-motion";

const ProjectList: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.8 } }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="w-full max-w-6xl mx-auto px-6"
        >
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                    <ProjectCard key={project.id} project={project} index={index} />
                ))}
            </ul>
        </motion.div>
    );
};

export default ProjectList;
