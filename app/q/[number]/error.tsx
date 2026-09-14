"use client";

import { PublicErrorPanel } from "../../components/PublicErrorPanel";

export default function QrResolverError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PublicErrorPanel reset={reset} />;
}
