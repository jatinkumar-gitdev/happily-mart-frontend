import { motion, AnimatePresence } from "framer-motion";
import {
  carouselSlideVariants,
  buttonVariants,
  dotVariants,
} from "../animations";
import { useCarousel, useResponsive } from "../hooks";
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { HERO_SLIDES } from "../../../data/YouMayLike";

const HeroCarousel = () => {
  const { currentIndex, direction, goToSlide, nextSlide, prevSlide } =
    useCarousel(HERO_SLIDES.length, true, 5000);
  const { isMobile } = useResponsive();

  const slideIn = HERO_SLIDES[currentIndex];

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] overflow-hidden bg-gray-900">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={carouselSlideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <motion.img
            src={slideIn.image}
            alt={slideIn.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-3xl"
            >
              {/* Title */}
              <h1 className="text-xl sm:text-3xl lg:text-5xl tracking-wide font-bold text-white mb-3 sm:mb-4 leading-tight whitespace-pre-line">
                {slideIn.title}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-xl text-gray-200 mb-6 sm:mb-8">
                {slideIn.subtitle}
              </p>

              {/* CTA Button */}
              <motion.button
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-white bg-gradient-to-r ${slideIn.color} shadow-lg hover:shadow-xl transition-shadow duration-300 text-sm sm:text-base`}
              >
                {slideIn.buttonText}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.button
        onClick={prevSlide}
        className="absolute left-0 top-1/2  z-20 bg-white/20 hover:bg-white/40 text-white px-2 py-6 rounded-r-xl transition-colors duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Previous slide"
      >
        <MdArrowBackIosNew size={isMobile ? 24 : 32} />
      </motion.button>

      <motion.button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 z-20 bg-white/20 hover:bg-white/40 text-white px-2 py-6 rounded-l-xl transition-colors duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Next slide"
      >
        <MdArrowForwardIos size={isMobile ? 24 : 32} />
      </motion.button>

      {/* Dots Navigation Indicators*/}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {HERO_SLIDES.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            variants={dotVariants}
            initial="inactive"
            animate={index === currentIndex ? "active" : "inactive"}
            transition={{ duration: 0.3 }}
            className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full cursor-pointer transition-all duration-300 ${
              index === currentIndex
                ? "bg-[--primary]"
                : "bg-[--primary] hover:bg-[--primary]"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default HeroCarousel;


