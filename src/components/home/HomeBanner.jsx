import { motion } from "framer-motion";
import YouMayLike from "./sections/YouMayLike";

const HomeBanner = () => {
  return (
    <motion.main className="w-full overflow-hidden">
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <YouMayLike />
      </motion.section>
    </motion.main>
  );
};

export default HomeBanner;
