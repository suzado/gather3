"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface WordRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

const containerVariants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: { staggerChildren: 0.08, delayChildren: delay },
  }),
};

const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
} as const;

export function WordReveal({ text, className, delay = 0 }: WordRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      className={className}
    >
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
