"use client";

import { useEffect, useRef, useState } from "react";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function move(event: PointerEvent) {
      const el = dotRef.current;
      if (!el) return;
      el.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    }

    function checkTarget(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      setHovering(Boolean(target?.closest("a, button, input, textarea, [data-cursor-hover]")));
    }

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointermove", checkTarget, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointermove", checkTarget);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div ref={dotRef} className={`cursor-dot${hovering ? " is-hover" : ""}`} aria-hidden="true" />;
}
