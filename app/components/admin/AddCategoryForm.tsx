"use client";

import { useActionState } from "react";
import { addCategoryAction } from "../../admin/business-actions";
import type { FormActionState } from "../../admin/actions";
import { Button } from "./ui/Button";

const initialState: FormActionState = { error: null };

export function AddCategoryForm({ businessId }: { businessId: number }) {
  const [state, formAction, pending] = useActionState(addCategoryAction.bind(null, businessId), initialState);

  return (
    <form action={formAction} className="admin-form admin-form-row admin-form-compact">
      <label>
        <span>New category name</span>
        <input name="name" type="text" placeholder="Mains" required />
      </label>
      {state?.error && <p className="admin-form-error">{state.error}</p>}
      <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Adding…" : "Add category"}</Button>
    </form>
  );
}
