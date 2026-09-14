"use client";

import { useActionState } from "react";
import { createBusinessAction } from "../../admin/business-actions";
import type { FormActionState } from "../../admin/actions";
import { Button } from "./ui/Button";

const initialState: FormActionState = { error: null };

export function CreateBusinessForm() {
  const [state, formAction, pending] = useActionState(createBusinessAction, initialState);

  return (
    <form action={formAction} className="admin-form admin-form-row">
      <label>
        <span>Business name</span>
        <input name="name" type="text" required />
      </label>
      <label>
        <span>Slug</span>
        <input name="slug" type="text" placeholder="bay-house-kotor" required />
      </label>
      <label>
        <span>Location</span>
        <input name="location" type="text" placeholder="Kotor, Montenegro" />
      </label>
      {state?.error && <p className="admin-form-error">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create business"}</Button>
    </form>
  );
}
