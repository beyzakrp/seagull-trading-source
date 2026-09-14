import type { Metadata } from "next";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../../auth/session";
import { getDb } from "../../../../db";
import { admins, businesses, menuCategories, menuItems } from "../../../../db/schema";
import { AdminTopBar } from "../../../components/admin/AdminTopBar";
import { EditBusinessForm } from "../../../components/admin/EditBusinessForm";
import { CreatePortalAccessForm } from "../../../components/admin/CreatePortalAccessForm";
import { MenuEditor } from "../../../components/MenuEditor";

export const metadata: Metadata = { title: "Edit business | Seagull Trading" };

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const businessId = Number(id);
  if (!Number.isInteger(businessId)) notFound();

  const db = await getDb();
  const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!business) notFound();

  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.businessId, businessId))
    .orderBy(menuCategories.sortOrder);

  const items = categories.length
    ? await db
        .select()
        .from(menuItems)
        .where(inArray(menuItems.categoryId, categories.map((category) => category.id)))
    : [];

  const [portalAccount] = await db
    .select({ username: admins.username })
    .from(admins)
    .where(eq(admins.businessId, businessId))
    .limit(1);

  return (
    <>
      <AdminTopBar />
      <div className="admin-page">
        <p className="admin-breadcrumb">
          <a href="/admin">← All businesses</a>
        </p>
        <h1>{business.name}</h1>
        <EditBusinessForm business={business} />

        <h2>Portal access</h2>
        {portalAccount ? (
          <p className="admin-empty">
            This business can log in at <a href="/portal/login">/portal/login</a> as <strong>{portalAccount.username}</strong>.
          </p>
        ) : (
          <CreatePortalAccessForm businessId={businessId} />
        )}

        <MenuEditor businessId={businessId} categories={categories} items={items} />
      </div>
    </>
  );
}
