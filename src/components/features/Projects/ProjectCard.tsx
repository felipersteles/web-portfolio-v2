import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { CheckCircle, Star } from "lucide-react";
import { Github } from "../../../assets/icons";
import type { ProjectDTO } from "../../../data/projects";

type ProjectCardParams = {
    project: ProjectDTO;
};

const ProjectCard = ({ project }: ProjectCardParams) => {
    return (
        <motion.li
            key={project.id}
            variants={Item}
            className="
        group w-80 h-[40vh] bg-text text-body 
        p-6 mr-32 rounded-[0_50px_0_50px] flex flex-col justify-between 
        border border-body transition-all duration-200 ease-in-out
        hover:bg-body hover:text-text hover:border-text
        max-[800px]:w-64 max-[800px]:mr-24 max-[800px]:h-[35vh]
        max-[640px]:w-56 max-[640px]:mr-16 max-[640px]:h-[35vh]
        max-[480px]:w-48 max-[480px]:mr-16 max-[480px]:p-4
        max-[400px]:w-40 max-[400px]:mr-16 max-[400px]:h-[40vh]
      "
        >
            {/* Header */}
            <div className="flex justify-between w-full items-center">
                <h2 className="text-[calc(1em+0.5vw)] font-bold">
                    {project.name}
                </h2>

                {/* Icone de disponibilidade */}
                {project.star ? (
                    <Star
                        size={30}
                        className="text-yellow-500 group-hover:text-green-400 transition-colors duration-200"
                    />
                ) : (
                    <CheckCircle
                        size={30}
                        className="text-green-500 group-hover:text-green-400 transition-colors duration-200"
                    />
                )}
            </div>

            {/* Description */}
            <h2
                className="
          text-[calc(0.8em+0.3vw)] font-[500] font-[Karla,sans-serif]
          max-[480px]:text-[calc(0.7em+0.3vw)]
          max-[400px]:text-[calc(0.6em+0.3vw)]
        "
            >
                {project.description}
            </h2>

            {/* Tags */}
            <div
                className="
          border-t-2 border-body pt-2 flex flex-wrap
          group-hover:border-text
        "
            >
                {project.tags.map((t, id) => (
                    <span
                        key={id}
                        className="
              mr-4 text-[calc(0.8em+0.3vw)]
              max-[480px]:text-[0.7em]
            "
                    >
                        #{t}
                    </span>
                ))}
            </div>

            {/* Footer */}
            <footer className="flex justify-between items-center">
                <a
                    href={project.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="
            bg-body text-text no-underline px-[calc(2rem+2vw)] py-2
            rounded-bl-[50px] text-[calc(1em+0.5vw)]
            group-hover:bg-text group-hover:text-body
            transition-all duration-200
          "
                >
                    Go to site.
                </a>

                {project.github && (
                    <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        className="
              text-inherit transition-colors
              group-hover:text-blue-500
            "
                    >
                        <Github
                            width={30}
                            height={30}
                            className="transition-colors duration-200"
                        />
                    </a>
                )}
            </footer>
        </motion.li>
    );
};

// Framer Motion configuration
const Item: Variants = {
    hidden: { scale: 0 },
    show: {
        scale: 1,
        transition: { type: "spring", duration: 0.5 },
    },
};

export default ProjectCard;
