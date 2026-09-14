"use client";

// Route-level safety net for the diner-facing /menu/[slug] and /q/[number]
// pages — without this, any unexpected error (a transient D1 hiccup, bad
// data) replaces the page with Next's raw default crash screen instead of
// something a diner scanning a QR code in a restaurant can make sense of.
// Same reasoning as app/components/admin/ErrorPanel.tsx, kept as a
// separate component because this one must not import anything from the
// admin UI kit — it renders on fully public, unauthenticated traffic.
export function PublicErrorPanel({ reset }: { reset: () => void }) {
  return (
    <div className="public-menu-page">
      <main className="public-menu-content public-menu-status">
        <h1>Something went wrong</h1>
        <p>This menu couldn't load right now. Please try again, or ask a member of staff.</p>
        <button type="button" className="button button-primary" onClick={reset}>
          Try again
        </button>
      </main>
    </div>
  );
}
