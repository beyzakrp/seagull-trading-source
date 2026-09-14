"use client";

import { AnimatePresence, motion } from "motion/react";
import { springs } from "./motion-config";
import type { ReactNode } from "react";

export type BadgeTone = "success" | "warning" | "danger" | "neutral";

// Keyed on tone so a status flip (e.g. available -> unavailable after a
// Server Action + revalidatePath) cross-fades the old pill out and pops the
// new one in, instead of an instant color swap.
export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={tone}
        className={`ui-badge ui-badge-${tone}`}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={springs.snappy}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}
