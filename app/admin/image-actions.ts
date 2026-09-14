"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireBusinessAccess } from "../../auth/session";
import { getDb } from "../../db";
import { menuCategories, menuItems } from "../../db/schema";
import { getBucket } from "../../storage/r2";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB — Workers request bodies aren't unlimited, and menu photos don't need to be huge.
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function findOwnedItem(itemId: number, categoryId: number, businessId: number) {
  const db = await getDb();
  // Tenant isolation: the category must belong to this business, and the
  // item must belong to that category — two hops, both checked.
  const [category] = await db
    .select({ id: menuCategories.id })
    .from(menuCategories)
    .where(and(eq(menuCategories.id, categoryId), eq(menuCategories.businessId, businessId)))
    .limit(1);
  if (!category) throw new Error("Category not found for this business.");

  const [item] = await db
    .select({ id: menuItems.id, imageKey: menuItems.imageKey })
    .from(menuItems)
    .where(and(eq(menuItems.id, itemId), eq(menuItems.categoryId, categoryId)))
    .limit(1);
  if (!item) throw new Error("Item not found in this category.");

  return { db, item };
}

export type ImageActionState = { error: string | null };

// Returns { error } instead of throwing, and takes the useActionState
// (prevState, formData) shape after the bound itemId/categoryId/businessId
// args — a thrown Error here would otherwise blow away the *entire* page
// (Next's nearest error boundary unmounts the whole route segment, not just
// this row), which is exactly what happened when a user uploaded an
// unsupported format (e.g. an iPhone HEIC photo — not in ALLOWED_TYPES) or
// an oversized file: the validation error crashed the whole business/portal
// page instead of showing an inline message next to the upload button.
export async function uploadItemImageAction(
  itemId: number,
  categoryId: number,
  businessId: number,
  _prev: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  await requireBusinessAccess(businessId);

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Image must be 4MB or smaller." };
  }
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return { error: "Image must be JPEG, PNG or WebP (not HEIC or other formats)." };
  }

  try {
    const { db, item } = await findOwnedItem(itemId, categoryId, businessId);

    const bucket = await getBucket();
    const key = `menu-items/${itemId}-${Date.now()}.${extension}`;
    await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });

    const previousKey = item.imageKey;
    await db.update(menuItems).set({ imageKey: key }).where(eq(menuItems.id, itemId));

    if (previousKey) {
      await bucket.delete(previousKey).catch(() => {}); // best-effort cleanup of the replaced photo
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to upload image." };
  }

  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/portal");
  return { error: null };
}

export async function removeItemImageAction(
  itemId: number,
  categoryId: number,
  businessId: number,
  _formData: FormData,
): Promise<void> {
  await requireBusinessAccess(businessId);

  const { db, item } = await findOwnedItem(itemId, categoryId, businessId);
  if (!item.imageKey) return;

  const bucket = await getBucket();
  await bucket.delete(item.imageKey);
  await db.update(menuItems).set({ imageKey: null }).where(eq(menuItems.id, itemId));

  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/portal");
}
