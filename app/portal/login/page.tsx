import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../../../auth/session";
import { PortalLoginForm } from "../../components/portal/PortalLoginForm";

export const metadata: Metadata = { title: "Business portal login | Seagull Trading" };

export default async function PortalLoginPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "business_owner" ? "/portal" : "/admin");
  }

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <h1>Menu Portal</h1>
        <p>Sign in to manage your menu.</p>
        <PortalLoginForm />
      </div>
    </div>
  );
}
