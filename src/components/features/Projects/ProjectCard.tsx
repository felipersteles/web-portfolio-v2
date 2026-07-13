import { motion } from "framer-motion";
import { CheckCircle, Star } from "lucide-react";
import { Github } from "../../../assets/icons";
import type { ProjectDTO } from "../../../data/projects";

type ProjectCardParams = {
    project: ProjectDTO;
    index?: number;
};

const ProjectCard = ({ project, index = 0 }: ProjectCardParams) => {
    return (
        <motion.li
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group flex flex-col cursor-pointer
                       bg-text/90 backdrop-blur-md text-body
                       border border-body/30
                       rounded-[0_30px_0_30px] overflow-hidden
                       shadow-lg hover:shadow-2xl
                       transition-shadow duration-300"
            style={{ willChange: "transform" }}
        >
            {/* Browser chrome */}
            <div className="bg-body/20 backdrop-blur-sm text-body
                            border-b border-body/20
                            px-3 py-2 flex items-center gap-2 shrink-0">
                <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-300" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs truncate opacity-50 ml-1">{project.demo}</span>
            </div>

            {/* iframe preview */}
            <div className="relative overflow-hidden shrink-0" style={{ height: "180px" }}>
                <iframe
                    src={project.demo}
                    title={project.name}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                    className="border-0 pointer-events-none absolute top-0 left-0"
                    style={{
                        width: "333%",
                        height: "600px",
                        transform: "scale(0.3)",
                        transformOrigin: "top left",
                    }}
                />
                {/* subtle overlay on hover */}
                <div className="absolute inset-0 bg-text/0 group-hover:bg-text/10 transition-colors duration-300" />
            </div>

            {/* Card body */}
            <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex justify-between items-center">
                    <h2 className="text-base font-bold">{project.name}</h2>
                    {project.star ? (
                        <Star size={20} className="text-yellow-300 group-hover:text-yellow-200 transition-colors duration-200 shrink-0" />
                    ) : (
                        <CheckCircle size={20} className="text-green-400 group-hover:text-green-300 transition-colors duration-200 shrink-0" />
                    )}
                </div>

                <p className="text-sm font-medium font-[Karla,sans-serif] opacity-80 flex-1">
                    {project.description}
                </p>

                <div className="border-t border-body/30 pt-2 flex flex-wrap gap-x-3">
                    {project.tags.map((t, id) => (
                        <span key={id} className="text-xs opacity-60">#{t}</span>
                    ))}
                </div>

                <footer className="flex justify-between items-center">
                    <a
                        href={project.demo}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-body/20 hover:bg-body/40 text-body no-underline
                                   px-5 py-2 rounded-bl-[24px] text-sm
                                   transition-all duration-200 cursor-pointer"
                    >
                        Go to site.
                    </a>
                    {project.github && (
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-body/60 hover:text-body transition-colors cursor-pointer"
                        >
                            <Github width={24} height={24} className="transition-colors duration-200" />
                        </a>
                    )}
                </footer>
            </div>
        </motion.li>
    );
};

export default ProjectCard;
