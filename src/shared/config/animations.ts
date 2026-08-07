import { Variants, Transition } from 'framer-motion';

// --- BUTTON ANIMATIONS ---
export const buttonHoverTap = {
  hover: { scale: 1.02, y: -1 },
  tap: { scale: 0.96 },
};

export const buttonDangerTap = {
  hover: { scale: 1.02, y: -1, backgroundColor: 'rgba(220, 38, 38, 0.95)' }, // Tailwind danger hover
  tap: { 
    scale: 0.96, 
    x: [-2, 2, -2, 2, 0], 
    transition: { duration: 0.25, ease: 'easeInOut' } 
  },
};

export const buttonSecondaryHover = {
  hover: { scale: 1.02 },
  tap: { scale: 0.96 },
};

// --- MODAL ANIMATIONS ---
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 15 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 25 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: { duration: 0.2, ease: 'easeIn' } 
  }
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

// --- FORM & INPUT ANIMATIONS ---
export const errorSlideDown: Variants = {
  hidden: { opacity: 0, y: -5, height: 0 },
  visible: { 
    opacity: 1, 
    y: 0, 
    height: 'auto',
    transition: { duration: 0.2, ease: 'easeOut' } 
  },
  exit: { 
    opacity: 0, 
    y: -5, 
    height: 0,
    transition: { duration: 0.15, ease: 'easeIn' } 
  }
};

// --- BADGE & INDICATOR ANIMATIONS ---
export const badgePop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: 'spring', stiffness: 400, damping: 25 } 
  }
};

// --- LAYOUT & NAVIGATION ANIMATIONS ---
export const activeNavIndicatorTransition: Transition = {
  type: 'spring',
  stiffness: 450,
  damping: 30
};
