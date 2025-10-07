import { motion } from "framer-motion";
import { FELIPE_TELES } from "../../data/about";
import me from "../../assets/imgs/nca.jpeg";

const AboutPage = () => {
  return (
    <motion.div
      className="relative flex items-center justify-center w-screen min-h-screen p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-4xl max-h-[80vh] overflow-y-auto bg-primary/50 backdrop-blur-md px-10 py-8 rounded-2xl shadow-2xl text-white text-lg leading-relaxed text-justify space-y-6">
        <h1 className="text-4xl font-bold border-b-4 border-blue-400 pb-3 mb-4">
          About Me
        </h1>

        {/* First paragraphs before image */}
        {FELIPE_TELES.bio.slice(0, 2).map((paragraph, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.3 }}
            className="text-base sm:text-lg"
          >
            {paragraph}
          </motion.p>
        ))}

        {/* Image floated left */}
        <motion.img
          src={me}
          alt="me"
          className="float-left w-48 sm:w-56 md:w-64 mr-6 mb-4 rounded-xl shadow-xl border-2 border-white/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Text beside and below image */}
        {FELIPE_TELES.bio.slice(2).map((paragraph, index) => (
          <motion.p
            key={index}
            className="mb-4 text-base sm:text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.3 }}
          >
            {paragraph}
          </motion.p>
        ))}

        <motion.a
          href={FELIPE_TELES.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 text-blue-400 border-b border-blue-400 font-semibold hover:text-white hover:border-white transition-all duration-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: FELIPE_TELES.bio.length * 0.3 }}
        >
          View my full resume
        </motion.a>
      </div>
    </motion.div>
  );
};

export default AboutPage;
