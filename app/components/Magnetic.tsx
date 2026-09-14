"use client";

import { useRef, type PointerEvent, type ReactElement } from "react";

export function Magnetic({ children, strength = 0.35 }: { children: ReactElement; strength?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  // Magnetic already owns this element's `transform` (translate follows the
  // pointer), so press feedback has to be composed into that same inline
  // transform rather than left to a CSS `:active` rule — a separate CSS rule
  // would be silently overridden by this component's own inline style on
  // every pointermove. Track the live offset so press/release can recompute
  // the combined transform without waiting for the next move event.
  const offset = useRef({ x: 0, y: 0 });
  const pressed = useRef(false);

  function applyTransform() {
    const el = ref.current;
    if (!el) return;
    const scale = pressed.current ? 0.96 : 1;
    el.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px) scale(${scale})`;
  }

  function handleMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    offset.current = {
      x: (event.clientX - (rect.left + rect.width / 2)) * strength,
      y: (event.clientY - (rect.top + rect.height / 2)) * strength,
    };
    applyTransform();
  }

  function handleLeave() {
    offset.current = { x: 0, y: 0 };
    pressed.current = false;
    applyTransform();
  }

  // Compose press feedback with the pointer translation.
  function handleDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    pressed.current = true;
    applyTransform();
  }

  function handleUp(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    pressed.current = false;
    applyTransform();
  }

  // Own the animated DOM node instead of cloning a Server Component child.
  // This keeps the child's server-rendered and hydrated attributes identical.
  return (
    <span
      ref={ref}
      className="magnetic"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerCancel={handleLeave}
    >
      {children}
    </span>
  );
}
