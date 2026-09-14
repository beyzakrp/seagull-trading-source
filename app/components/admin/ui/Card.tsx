"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { fadeInUp } from "./motion-config";
import type { ReactNode } from "react";

export function Card({
  className = "",
  children,
  ...props
}: HTMLMotionProps<"div"> & { className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={`ui-card ${className}`.trim()}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHead({ children }: { children: ReactNode }) {
  return <div className="ui-card-head">{children}</div>;
}
