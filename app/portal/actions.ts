"use server";

import { redirect } from "next/navigation";
import { verifyLogin } from "../../auth/login";
import { createSession } from "../../auth/session";
import type { FormActionState } from "../admin/actions";

export async function portalLoginAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Enter a username and password." };
  }

  const result = await verifyLogin(username, password);
  if (!result) {
    return { error: "Invalid username or password." };
  }
  if (result.role !== "business_owner") {
    return { error: "This login is for business owners. Seagull staff should use the admin login." };
  }

  await createSession(result.id);
  redirect("/portal");
}
