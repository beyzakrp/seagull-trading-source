"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/Button";
import { springs } from "./ui/motion-config";

// Replaces window.confirm() with a popover anchored to the trigger button
// (transform-origin at the anchor, not the viewport center — Apple's
// spatial-consistency rule: a popover should visibly originate from what
// opened it). Confirm is a real type="submit" inside the existing form, so
// the bound Server Action wiring is unchanged; only the confirm UI moved.
export function DeleteButton({
  action,
  label = "Delete",
  confirmMessage = "Are you sure?",
}: {
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
  confirmMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (anchorRef.current && !anchorRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="admin-delete-anchor" ref={anchorRef}>
      <form action={action} className="admin-inline-form">
        <Button type="button" variant="danger" size="sm" onClick={() => setOpen((value) => !value)}>
          {label}
        </Button>
        <AnimatePresence>
          {open && (
            <motion.div
              className="admin-delete-popover"
              style={{ transformOrigin: "top left" }}
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={springs.snappy}
            >
              <p>{confirmMessage}</p>
              <div className="admin-delete-popover-actions">
                <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm">
                  Confirm
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
