import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasAnyAdmin } from "../../../auth/bootstrap";
import { getSession } from "../../../auth/session";
import { LoginForm } from "../../components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin login | Seagull Trading",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "staff" ? "/admin" : "/portal");
  }
  if (!(await hasAnyAdmin())) {
    redirect("/admin/setup");
  }

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <h1>Seagull Admin</h1>
        <p>Sign in to manage businesses, menus and QR codes.</p>
        <LoginForm />
      </div>
    </div>
  );
}
