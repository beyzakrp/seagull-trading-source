import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasAnyAdmin } from "../../../auth/bootstrap";
import { SetupForm } from "../../components/admin/SetupForm";

export const metadata: Metadata = {
  title: "Set up admin | Seagull Trading",
};

export default async function SetupPage() {
  if (await hasAnyAdmin()) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <h1>Create the first admin account</h1>
        <p>This page only works once. After the first account exists, it redirects to the login page.</p>
        <SetupForm />
      </div>
    </div>
  );
}
