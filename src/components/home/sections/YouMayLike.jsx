import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdPostAdd } from "react-icons/md";
import { useResponsive } from "../hooks";
import HeroCarousel from "./HeroCarousel";
import { YouMayLikeData } from "../../../data/YouMayLike";
import CreatePost from "../../feed/CreatePost";


const YouMayLike = () => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  return (
    <div className="w-full py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <HeroCarousel />
        


          </motion.div>

          <motion.div
            className="w-full lg:w-72"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                You May Like
              </h2>
              <div className="w-20 h-1 bg-red-500 mt-2 rounded-full" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-4 mb-6">
              {YouMayLikeData.slice(0, isMobile ? 4 : isTablet ? 6 : 5).map(
                (item) => (
                  <motion.div
                    key={item.id}
                    className="flex flex-col lg:hover:rounded-xl lg:hover:shadow-lg lg:hover:border lg:hover:border-gray-200 lg:hover:p-2 transition-all hover:cursor-pointer hover:duration-300  sm:flex-row lg:flex-col items-start gap-3 text-center lg:text-left"
                  >
                    <div className="flex items-center gap-4">
                      {" "}
                      <div>
                        {" "}
                        <img
                          src={item.image || "/placeholder-product.png"}
                          alt={item.title}
                          className="w-16 h-16 object-contain rounded-md"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                          {item.title}
                        </h3>
                        {item.subTitle && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.subTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </div>

            {/* Post Request Button */}
            <motion.div className="mb-2 text-gray-500 text-base text-start">
              <motion.p>No desirable products? </motion.p>
            </motion.div>
            <motion.button
              onClick={() => setShowRequestForm(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[--button-bg] hover:from-red-600 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg transition-all"
            >
              <MdPostAdd className="text-2xl" />
              <span>Post Your Request Now</span>
            </motion.button>
            {/* Render CreatePost as modal */}
            <AnimatePresence>
              {showRequestForm && (
                <motion.div
                  key="create-post-modal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0.98 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="relative w-full max-w-2xl mx-4 z-50"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                      <CreatePost open={true} onClose={() => setShowRequestForm(false)} />
                    </div>
                  </motion.div>
                  <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setShowRequestForm(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default YouMayLike;
