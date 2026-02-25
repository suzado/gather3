"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BLADE_PATH =
  "M29 23 L27.5 9 A4.5 4.5 0 0 1 36.5 9 L35 23 A3 3 0 0 1 29 23Z";
const BLADE_ROTATIONS = [0, 120, 240];
const BLADE_TILT = 15;

type Animation = "spin" | "pulse" | "assemble" | "loading";

interface AnimatedLogoProps {
  size?: number;
  animation?: Animation;
  className?: string;
}

function StaticBlades() {
  return (
    <>
      {BLADE_ROTATIONS.map((r) => (
        <g key={r} transform={`rotate(${r}, 32, 32)`}>
          <path
            d={BLADE_PATH}
            transform={`rotate(${BLADE_TILT}, 32, 16)`}
          />
        </g>
      ))}
    </>
  );
}

function Mark({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <StaticBlades />
    </svg>
  );
}

export function AnimatedLogo({
  size = 40,
  animation = "spin",
  className,
}: AnimatedLogoProps) {
  if (animation === "spin") {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className={cn("inline-flex", className)}
      >
        <Mark size={size} />
      </motion.div>
    );
  }

  if (animation === "pulse") {
    return (
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className={cn("inline-flex", className)}
      >
        <Mark size={size} />
      </motion.div>
    );
  }

  if (animation === "assemble") {
    return (
      <motion.div
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn("inline-flex", className)}
      >
        <svg
          viewBox="0 0 64 64"
          fill="currentColor"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          {BLADE_ROTATIONS.map((r, i) => (
            <motion.g
              key={r}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.1 + i * 0.12,
                duration: 0.4,
                ease: "easeOut",
              }}
            >
              <g transform={`rotate(${r}, 32, 32)`}>
                <path
                  d={BLADE_PATH}
                  transform={`rotate(${BLADE_TILT}, 32, 16)`}
                />
              </g>
            </motion.g>
          ))}
        </svg>
      </motion.div>
    );
  }

  // loading: rotation + staggered blade opacity chase
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className={cn("inline-flex", className)}
    >
      <svg
        viewBox="0 0 64 64"
        fill="currentColor"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {BLADE_ROTATIONS.map((r, i) => (
          <motion.g
            key={r}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          >
            <g transform={`rotate(${r}, 32, 32)`}>
              <path
                d={BLADE_PATH}
                transform={`rotate(${BLADE_TILT}, 32, 16)`}
              />
            </g>
          </motion.g>
        ))}
      </svg>
    </motion.div>
  );
}

interface LogoSpinnerProps {
  size?: number;
  label?: string;
  className?: string;
}

export function LogoSpinner({
  size = 40,
  label,
  className,
}: LogoSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <AnimatedLogo
        size={size}
        animation="loading"
        className="text-violet-400"
      />
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
