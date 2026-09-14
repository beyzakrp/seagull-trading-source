"use server";

import { redirect } from "next/navigation";
import { createFirstAdminAccount } from "../../auth/bootstrap";
import { verifyLogin } from "../../auth/login";
import { createSession, destroySession, getSession } from "../../auth/session";

export type FormActionState = { error: string | null };

export async function loginAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Enter a username and password." };
  }

  const result = await verifyLogin(username, password);
  if (!result) {
    return { error: "Invalid username or password." };
  }
  if (result.role !== "staff") {
    return { error: "This login is for Seagull staff. Business owners should use the business portal." };
  }

  await createSession(result.id);
  redirect("/admin");
}

export async function setupAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const result = await createFirstAdminAccount(username, password);
  if ("error" in result) {
    return { error: result.error };
  }

  await createSession(result.id);
  redirect("/admin");
}

// Shared by both the admin top bar and the portal top bar — send each role
// back to its own login page rather than hardcoding /admin/login.
export async function logoutAction(): Promise<void> {
  const account = await getSession();
  await destroySession();
  redirect(account?.role === "business_owner" ? "/portal/login" : "/admin/login");
}
