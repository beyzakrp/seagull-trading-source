"use client";

import { useActionState } from "react";
import { portalLoginAction } from "../../portal/actions";
import type { FormActionState } from "../../admin/actions";
import { Button } from "../admin/ui/Button";

const initialState: FormActionState = { error: null };

export function PortalLoginForm() {
  const [state, formAction, pending] = useActionState(portalLoginAction, initialState);

  return (
    <form action={formAction} className="admin-form">
      <label>
        <span>Username</span>
        <input name="username" type="text" autoComplete="username" required autoFocus />
      </label>
      <label>
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error && <p className="admin-form-error">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}
