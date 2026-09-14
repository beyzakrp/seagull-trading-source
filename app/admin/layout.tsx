import { MotionProvider } from "../components/admin/ui/MotionProvider";

// No marketing Header/Footer/Cursor/Reveal/Magnetic here — this is a
// different, deliberate motion system (Apple fluid-interface springs via
// Motion, see CLAUDE.md, Coding Rules → Admin motion), not the marketing
// site's animation components. Styles are namespaced under .admin-panel in
// app/globals.css rather than a separate stylesheet.
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <MotionProvider>
      <div className="admin-panel">{children}</div>
    </MotionProvider>
  );
}
