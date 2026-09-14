"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../auth/session";
import { getDb } from "../../db";
import { qrCodes } from "../../db/schema";

async function nextQrNumber(): Promise<string> {
  const db = await getDb();
  const rows = await db.select({ number: qrCodes.number }).from(qrCodes);
  const max = rows.reduce((highest, row) => {
    const parsed = Number(row.number);
    return Number.isFinite(parsed) && parsed > highest ? parsed : highest;
  }, 0);
  return String(max + 1).padStart(6, "0");
}

export async function generateQrCodeAction(): Promise<void> {
  await requireAdmin();

  const db = await getDb();
  const number = await nextQrNumber();
  await db.insert(qrCodes).values({ number, status: "unassigned" });
  revalidatePath("/admin/qr-codes");
}

export async function assignQrCodeAction(qrId: number, formData: FormData): Promise<void> {
  await requireAdmin();

  const businessId = Number(formData.get("businessId"));
  if (!Number.isInteger(businessId)) throw new Error("Choose a business to assign this QR code to.");

  const db = await getDb();
  await db
    .update(qrCodes)
    .set({ businessId, status: "active", assignedAt: new Date().toISOString() })
    .where(eq(qrCodes.id, qrId));
  revalidatePath("/admin/qr-codes");
}

export async function unassignQrCodeAction(qrId: number, _formData: FormData): Promise<void> {
  await requireAdmin();

  const db = await getDb();
  await db
    .update(qrCodes)
    .set({ businessId: null, status: "unassigned", assignedAt: null })
    .where(eq(qrCodes.id, qrId));
  revalidatePath("/admin/qr-codes");
}

export async function toggleQrCodeStatusAction(qrId: number, currentStatus: string, _formData: FormData): Promise<void> {
  await requireAdmin();

  if (currentStatus !== "active" && currentStatus !== "inactive") {
    throw new Error("Only an assigned QR code can be toggled active/inactive.");
  }
  const nextStatus = currentStatus === "active" ? "inactive" : "active";

  const db = await getDb();
  await db.update(qrCodes).set({ status: nextStatus }).where(eq(qrCodes.id, qrId));
  revalidatePath("/admin/qr-codes");
}
