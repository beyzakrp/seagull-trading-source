"use client";

import { useActionState } from "react";
import { createBusinessOwnerAction } from "../../admin/business-actions";
import type { FormActionState } from "../../admin/actions";
import { Button } from "./ui/Button";

const initialState: FormActionState = { error: null };

export function CreatePortalAccessForm({ businessId }: { businessId: number }) {
  const [state, formAction, pending] = useActionState(createBusinessOwnerAction, initialState);

  return (
    <form action={formAction} className="admin-form admin-form-row admin-form-compact">
      <input type="hidden" name="businessId" value={businessId} />
      <label>
        <span>Username</span>
        <input name="username" type="text" placeholder="bay-house-kotor" required />
      </label>
      <label>
        <span>Password</span>
        <input name="password" type="password" minLength={10} required />
      </label>
      {state?.error && <p className="admin-form-error">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create portal login"}</Button>
    </form>
  );
}
