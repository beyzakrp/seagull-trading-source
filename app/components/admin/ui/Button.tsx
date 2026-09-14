"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { springs } from "./motion-config";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "topbar";
export type ButtonSize = "sm" | "md";

// Response (WWDC 2018, §1): feedback starts on press, not on release —
// whileTap fires on pointerdown. Critically damped spring (no overshoot)
// for the default press/hover feel; see motion-config.ts for why. Reduced
// motion is handled globally by <MotionConfig reducedMotion="user"> in the
// admin/portal layouts, not per-component.
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: HTMLMotionProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <motion.button
      className={`ui-btn ui-btn-${variant} ui-btn-${size} ${className}`.trim()}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      whileHover={disabled ? undefined : { scale: 1.015 }}
      transition={springs.snappy}
      {...props}
    />
  );
}
