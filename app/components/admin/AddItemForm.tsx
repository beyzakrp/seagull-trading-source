"use client";

import { useActionState } from "react";
import { addItemAction } from "../../admin/business-actions";
import type { FormActionState } from "../../admin/actions";
import { Button } from "./ui/Button";

const initialState: FormActionState = { error: null };

export function AddItemForm({ categoryId, businessId }: { categoryId: number; businessId: number }) {
  const [state, formAction, pending] = useActionState(
    addItemAction.bind(null, categoryId, businessId),
    initialState,
  );

  return (
    <form action={formAction} className="admin-form admin-form-row admin-form-compact">
      <label>
        <span>Item name</span>
        <input name="name" type="text" placeholder="Bay Catch" required />
      </label>
      <label>
        <span>Description</span>
        <input name="description" type="text" placeholder="Daily fish, greens, lemon butter" />
      </label>
      <label>
        <span>Price</span>
        <input name="price" type="text" inputMode="decimal" placeholder="24.00" required />
      </label>
      <label>
        <span>Currency</span>
        <input name="currency" type="text" defaultValue="EUR" maxLength={3} />
      </label>
      {state?.error && <p className="admin-form-error">{state.error}</p>}
      <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Adding…" : "Add item"}</Button>
    </form>
  );
}
