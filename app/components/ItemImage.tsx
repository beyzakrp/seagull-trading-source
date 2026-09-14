"use client";

import { useActionState } from "react";
import { removeItemImageAction, uploadItemImageAction, type ImageActionState } from "../admin/image-actions";
import { DeleteButton } from "./admin/DeleteButton";
import { Button } from "./admin/ui/Button";

const initialState: ImageActionState = { error: null };

// Shared between /admin/businesses/[id] and /portal, same as MenuEditor —
// the underlying Server Actions authorize either caller via
// requireBusinessAccess(). Upload errors (wrong format, too large) show
// inline via useActionState instead of throwing, which would otherwise
// take down the whole page — see image-actions.ts.
export function ItemImage({
  itemId,
  categoryId,
  businessId,
  imageKey,
}: {
  itemId: number;
  categoryId: number;
  businessId: number;
  imageKey: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    uploadItemImageAction.bind(null, itemId, categoryId, businessId),
    initialState,
  );

  return (
    <div className="admin-item-image">
      {imageKey && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- R2-served, not a next/image-optimizable static asset */}
          <img src={`/api/images/${imageKey}`} alt="" className="admin-item-thumb" />
          <DeleteButton
            action={removeItemImageAction.bind(null, itemId, categoryId, businessId)}
            label="Remove photo"
            confirmMessage="Remove this item's photo?"
          />
        </>
      )}
      <form action={formAction} className="admin-image-upload">
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp" required />
        <Button type="submit" variant="ghost" size="sm" disabled={pending}>
          {pending ? "Uploading…" : imageKey ? "Change photo" : "Add photo"}
        </Button>
      </form>
      {state?.error && <p className="admin-form-error admin-item-image-error">{state.error}</p>}
    </div>
  );
}
