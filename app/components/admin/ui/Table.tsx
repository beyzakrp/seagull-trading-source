"use client";

import { motion } from "motion/react";
import { fadeInUp, staggerContainer } from "./motion-config";
import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

// Plain semantic <table>, no client state — a scrollable wrapper handles
// narrow viewports instead of collapsing to cards, which keeps every admin
// list reading the same way regardless of column count.
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="ui-table-wrap">
      <table className="ui-table">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHeaderCell({ children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props}>{children}</th>;
}

// Orchestrates the stagger: each TableRow child declares the matching
// fadeInUp variants and inherits "hidden"/"visible" from here rather than
// animating independently, so rows cascade in instead of popping at once.
export function TableBody({ children }: { children: ReactNode }) {
  return (
    <motion.tbody variants={staggerContainer()} initial="hidden" animate="visible">
      {children}
    </motion.tbody>
  );
}

export function TableRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.tr className={className} variants={fadeInUp}>
      {children}
    </motion.tr>
  );
}

export function TableCell({ children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props}>{children}</td>;
}
