export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

export const slideInFromLeftVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

export const slideInFromRightVariants = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  exit: {
    x: 100,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

export const scaleInVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: { scale: 1.05 },
};

export const hoverTapVariants = {
  whileHover: { scale: 1.05, y: -5 },
  whileTap: { scale: 0.95 },
};

export const carouselSlideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 500 : -500,
    opacity: 0,
    transition: { duration: 0.8, ease: "easeIn" },
  }),
};

export const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" },
  tap: { scale: 0.95 },
};

export const dotVariants = {
  active: { scale: 1.3, backgroundColor: "rgba(255,255,255,1)" },
  inactive: { scale: 1, backgroundColor: "rgba(255,255,255,0.5)" },
};
