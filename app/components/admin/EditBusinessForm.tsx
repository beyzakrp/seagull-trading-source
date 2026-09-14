"use client";

import { useActionState } from "react";
import { updateBusinessAction } from "../../admin/business-actions";
import type { FormActionState } from "../../admin/actions";
import { Button } from "./ui/Button";

const initialState: FormActionState = { error: null };

export function EditBusinessForm({
  business,
}: {
  business: { id: number; name: string; slug: string; location: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateBusinessAction, initialState);

  return (
    <form action={formAction} className="admin-form admin-form-row">
      <input type="hidden" name="businessId" value={business.id} />
      <label>
        <span>Business name</span>
        <input name="name" type="text" defaultValue={business.name} required />
      </label>
      <label>
        <span>Slug (/menu/…)</span>
        <input name="slug" type="text" defaultValue={business.slug} required />
      </label>
      <label>
        <span>Location</span>
        <input name="location" type="text" defaultValue={business.location ?? ""} />
      </label>
      {state?.error && <p className="admin-form-error">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}
