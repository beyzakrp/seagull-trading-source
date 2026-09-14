// Apple's "Designing Fluid Interfaces" damping/response model (WWDC 2018),
// translated to Motion's bounce/duration spring API. See CLAUDE.md, Coding
// Rules → Admin motion for the full reasoning and where these numbers come
// from. Reduced-motion is handled globally via <MotionConfig
// reducedMotion="user"> in app/admin/layout.tsx and app/portal/layout.tsx —
// individual components don't need to check the media query themselves.
export const springs = {
  // Default: critically damped, no overshoot — graceful and
  // non-distracting. Use for anything that isn't a direct result of a
  // flick/drag gesture (which is everything in this panel today).
  snappy: { type: "spring", bounce: 0, duration: 0.3 } as const,
  gentle: { type: "spring", bounce: 0, duration: 0.4 } as const,
  // Reserved for momentum-driven interactions (a flick, a throw) — nothing
  // in this admin panel does that yet, but keep it named and ready rather
  // than inventing overshoot for things that were never thrown.
  momentum: { type: "spring", bounce: 0.2, duration: 0.4 } as const,
};

// Shared stagger container variants for lists (table rows, cards). Children
// declare the matching `fadeInUp` variants and inherit "hidden"/"visible"
// from this parent — they don't need their own initial/animate props.
export function staggerContainer(staggerDelay = 0.04) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: staggerDelay } },
  };
}

// Entrance for individual list items (table rows, cards) — pairs with
// staggerContainer on the parent, or usable standalone with its own
// initial/animate.
export const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
};
