import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seagull Trading | Websites, Branding & QR Menus in Montenegro",
  description: "Seagull Trading creates strategic websites, distinctive brand identities, QR menus and digital products for businesses in Montenegro.",
  other: { "codex-preview": "development" },
  icons: { icon: "/seagull-blue-black.svg", shortcut: "/seagull-blue-black.svg" },
};

// Bare shell only. The marketing Header/Footer/Cursor live in
// app/(marketing)/layout.tsx — /admin/*, /menu/[slug] and /q/[number] are
// deliberately NOT marketing pages and must not inherit that chrome (see
// CLAUDE.md, Coding Rules).
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
