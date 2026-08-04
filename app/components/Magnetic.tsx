"use client";

import { cloneElement, isValidElement, useRef, type PointerEvent, type ReactElement } from "react";

export function Magnetic({ children, strength = 0.35 }: { children: ReactElement; strength?: number }) {
  const ref = useRef<HTMLElement | null>(null);

  function handleMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  }

  if (!isValidElement(children)) return children;

  return cloneElement(children as ReactElement<any>, {
    ref,
    onPointerMove: handleMove,
    onPointerLeave: handleLeave,
    className: `magnetic ${(children.props as any).className ?? ""}`.trim(),
  });
}
