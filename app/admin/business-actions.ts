"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword } from "../../auth/password";
import { requireAdmin, requireBusinessAccess } from "../../auth/session";
import { USERNAME_PATTERN, USERNAME_RULE_MESSAGE } from "../../auth/username";
import { getDb } from "../../db";
import { admins, businesses, menuCategories, menuItems } from "../../db/schema";
import type { FormActionState } from "./actions";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function parseSlug(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim().toLowerCase();
}

async function slugTaken(slug: string, excludeId?: number): Promise<boolean> {
  const db = await getDb();
  const rows = await db.select({ id: businesses.id }).from(businesses).where(eq(businesses.slug, slug));
  return rows.some((row) => row.id !== excludeId);
}

// Staff-only: onboarding a new client business is a Seagull action, not
// something a business owner would ever do themselves.
export async function createBusinessAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slug = parseSlug(formData.get("slug"));
  const location = String(formData.get("location") ?? "").trim();

  if (!name) return { error: "Business name is required." };
  if (!SLUG_PATTERN.test(slug)) {
    return { error: "Slug must be lowercase letters, numbers and hyphens only, e.g. bay-house-kotor." };
  }
  if (await slugTaken(slug)) {
    return { error: "That slug is already in use." };
  }

  const db = await getDb();
  const [business] = await db
    .insert(businesses)
    .values({ name, slug, location: location || null })
    .returning({ id: businesses.id });

  revalidatePath("/admin");
  redirect(`/admin/businesses/${business.id}`);
}

// Shared by staff (full edit, including slug) and a business's own owner
// (name/location only — the portal form simply omits the slug field, so
// `formData.has("slug")` is false and the slug is left untouched). Slug
// changes stay effectively staff-gated without a separate code path.
export async function updateBusinessAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  const id = Number(formData.get("businessId"));
  if (!Number.isInteger(id)) return { error: "Invalid business." };
  await requireBusinessAccess(id);

  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  if (!name) return { error: "Business name is required." };

  const updates: Partial<typeof businesses.$inferInsert> = {
    name,
    location: location || null,
    updatedAt: new Date().toISOString(),
  };

  if (formData.has("slug")) {
    const slug = parseSlug(formData.get("slug"));
    if (!SLUG_PATTERN.test(slug)) {
      return { error: "Slug must be lowercase letters, numbers and hyphens only, e.g. bay-house-kotor." };
    }
    if (await slugTaken(slug, id)) {
      return { error: "That slug is already in use." };
    }
    updates.slug = slug;
  }

  const db = await getDb();
  await db.update(businesses).set(updates).where(eq(businesses.id, id));

  revalidatePath("/admin");
  revalidatePath(`/admin/businesses/${id}`);
  revalidatePath("/portal");
  return { error: null };
}

// FormActionState/useActionState shape, not throw+void — a thrown Error here
// hits Next's nearest error boundary and unmounts the *entire* route segment
// (see image-actions.ts for the same fix applied to photo upload), which is
// disproportionate for "you left the name blank."
export async function addCategoryAction(
  businessId: number,
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireBusinessAccess(businessId);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Category name is required." };

  const db = await getDb();
  await db.insert(menuCategories).values({ businessId, name });
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/portal");
  return { error: null };
}

export async function deleteCategoryAction(categoryId: number, businessId: number, _formData: FormData): Promise<void> {
  await requireBusinessAccess(businessId);

  const db = await getDb();
  // Tenant isolation: only touch rows that actually belong to this business.
  await db.delete(menuItems).where(eq(menuItems.categoryId, categoryId));
  await db.delete(menuCategories).where(and(eq(menuCategories.id, categoryId), eq(menuCategories.businessId, businessId)));
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/portal");
}

export async function addItemAction(
  categoryId: number,
  businessId: number,
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireBusinessAccess(businessId);

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const currency = String(formData.get("currency") ?? "EUR").trim().toUpperCase() || "EUR";

  if (!name) return { error: "Item name is required." };
  const priceUnits = Number(priceRaw.replace(",", "."));
  if (!Number.isFinite(priceUnits) || priceUnits < 0) return { error: "Price must be a positive number." };
  const priceMinor = Math.round(priceUnits * 100);

  const db = await getDb();
  // Tenant isolation: verify the category actually belongs to this business
  // before attaching an item to it.
  const [category] = await db
    .select({ id: menuCategories.id })
    .from(menuCategories)
    .where(and(eq(menuCategories.id, categoryId), eq(menuCategories.businessId, businessId)))
    .limit(1);
  if (!category) return { error: "Category not found for this business." };

  await db.insert(menuItems).values({ categoryId, name, description, priceMinor, currency });
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/portal");
  return { error: null };
}

export async function deleteItemAction(itemId: number, categoryId: number, businessId: number, _formData: FormData): Promise<void> {
  await requireBusinessAccess(businessId);

  const db = await getDb();
  const [category] = await db
    .select({ id: menuCategories.id })
    .from(menuCategories)
    .where(and(eq(menuCategories.id, categoryId), eq(menuCategories.businessId, businessId)))
    .limit(1);
  if (!category) throw new Error("Category not found for this business.");

  await db.delete(menuItems).where(and(eq(menuItems.id, itemId), eq(menuItems.categoryId, categoryId)));
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/portal");
}

export async function toggleItemAvailabilityAction(
  itemId: number,
  categoryId: number,
  businessId: number,
  isAvailable: boolean,
  _formData: FormData,
): Promise<void> {
  await requireBusinessAccess(businessId);

  const db = await getDb();
  const [category] = await db
    .select({ id: menuCategories.id })
    .from(menuCategories)
    .where(and(eq(menuCategories.id, categoryId), eq(menuCategories.businessId, businessId)))
    .limit(1);
  if (!category) throw new Error("Category not found for this business.");

  await db
    .update(menuItems)
    .set({ isAvailable: !isAvailable })
    .where(and(eq(menuItems.id, itemId), eq(menuItems.categoryId, categoryId)));
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/portal");
}

// Staff-only: provisions a portal login for a business. One business gets
// at most one owner account for now (deliberately simple — see CLAUDE.md).
export async function createBusinessOwnerAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  await requireAdmin();

  const businessId = Number(formData.get("businessId"));
  if (!Number.isInteger(businessId)) return { error: "Invalid business." };

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!USERNAME_PATTERN.test(username)) return { error: USERNAME_RULE_MESSAGE };
  if (password.length < 10) return { error: "Password must be at least 10 characters." };

  const db = await getDb();
  const [existing] = await db.select({ id: admins.id }).from(admins).where(eq(admins.username, username)).limit(1);
  if (existing) return { error: "That username is already taken." };

  const stored = await hashPassword(password);
  await db.insert(admins).values({
    username,
    passwordHash: stored.hash,
    passwordSalt: stored.salt,
    passwordIterations: stored.iterations,
    passwordAlgo: stored.algo,
    role: "business_owner",
    businessId,
  });

  revalidatePath(`/admin/businesses/${businessId}`);
  return { error: null };
}
