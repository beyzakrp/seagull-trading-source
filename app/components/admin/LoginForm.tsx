"use client";

import { useActionState } from "react";
import { loginAction, type FormActionState } from "../../admin/actions";
import { Button } from "./ui/Button";

const initialState: FormActionState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

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
