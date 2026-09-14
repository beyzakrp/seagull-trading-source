import { MotionProvider } from "../components/admin/ui/MotionProvider";

// No marketing chrome here either — same reasoning as app/admin/layout.tsx.
export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <MotionProvider>
      <div className="admin-panel">{children}</div>
    </MotionProvider>
  );
}
