"use client";

import { useActionState } from "react";
import { setupAction, type FormActionState } from "../../admin/actions";
import { Button } from "./ui/Button";

const initialState: FormActionState = { error: null };

export function SetupForm() {
  const [state, formAction, pending] = useActionState(setupAction, initialState);

  return (
    <form action={formAction} className="admin-form">
      <label>
        <span>Username</span>
        <input name="username" type="text" autoComplete="username" required autoFocus />
      </label>
      <label>
        <span>Password</span>
        <input name="password" type="password" autoComplete="new-password" minLength={10} required />
      </label>
      <label>
        <span>Confirm password</span>
        <input name="confirmPassword" type="password" autoComplete="new-password" minLength={10} required />
      </label>
      {state?.error && <p className="admin-form-error">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Creating account…" : "Create admin account"}</Button>
    </form>
  );
}
