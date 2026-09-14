"use client";

import { PublicErrorPanel } from "../../components/PublicErrorPanel";

export default function MenuError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PublicErrorPanel reset={reset} />;
}
