"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// framer-motion (which `motion/react` re-exports) ships no "use client"
// directives in its own build, so anything from it must be used from
// within a file that establishes the client boundary itself — this wrapper
// is that boundary, so app/admin/layout.tsx and app/portal/layout.tsx can
// stay plain Server Components and just render this as a child.
//
// reducedMotion="user" makes every nested motion.* component automatically
// honor the OS-level prefers-reduced-motion setting — individual
// components don't check the media query themselves (see CLAUDE.md, Coding
// Rules → Admin motion).
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
