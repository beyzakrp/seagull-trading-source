"use client";

import { Button } from "./ui/Button";

// Route-level safety net for /admin/* and /portal — without this, any
// thrown error from a Server Action (or a render error) replaces the
// entire page with a raw crash screen instead of a recoverable message.
// This is what a user saw as "I added a photo and then the whole menu
// disappeared" when an upload failed validation before that action was
// converted to return an error instead of throwing (see image-actions.ts).
// Keep this as a backstop even where actions return errors gracefully —
// it only ever fires for something unexpected.
export function ErrorPanel({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="admin-page">
      <div className="admin-error-panel">
        <h1>Something went wrong</h1>
        <p>{error.message || "An unexpected error occurred."}</p>
        <Button type="button" onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
