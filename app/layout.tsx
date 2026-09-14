import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seagull Trading | Websites, Branding & QR Menus in Montenegro",
  description: "Seagull Trading creates strategic websites, distinctive brand identities, QR menus and digital products for businesses in Montenegro.",
  other: { "codex-preview": "development" },
  icons: { icon: "/seagull-blue-black.svg", shortcut: "/seagull-blue-black.svg" },
};

// Marketing navigation is shared in app/(marketing)/layout.tsx.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
