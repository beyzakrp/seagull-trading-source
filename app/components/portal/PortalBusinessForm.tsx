"use client";

import { useActionState } from "react";
import { updateBusinessAction } from "../../admin/business-actions";
import type { FormActionState } from "../../admin/actions";
import { Button } from "../admin/ui/Button";

const initialState: FormActionState = { error: null };

// Same updateBusinessAction as the staff-side EditBusinessForm, but this
// form has no slug field — omitting it from formData means
// updateBusinessAction leaves the slug untouched (see its `formData.has
// ("slug")` check). Business owners can rename/relocate but not change
// their own URL slug.
export function PortalBusinessForm({
  business,
}: {
  business: { id: number; name: string; location: string | null };
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
        <span>Location</span>
        <input name="location" type="text" defaultValue={business.location ?? ""} />
      </label>
      {state?.error && <p className="admin-form-error">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}
