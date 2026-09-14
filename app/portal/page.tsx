import type { Metadata } from "next";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireBusinessOwner } from "../../auth/session";
import { getDb } from "../../db";
import { businesses, menuCategories, menuItems } from "../../db/schema";
import { PortalTopBar } from "../components/portal/PortalTopBar";
import { PortalBusinessForm } from "../components/portal/PortalBusinessForm";
import { MenuEditor } from "../components/MenuEditor";

export const metadata: Metadata = { title: "Menu Portal | Seagull Trading" };

export default async function PortalPage() {
  const account = await requireBusinessOwner();

  const db = await getDb();
  const [business] = await db.select().from(businesses).where(eq(businesses.id, account.businessId)).limit(1);
  if (!business) notFound();

  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.businessId, business.id))
    .orderBy(menuCategories.sortOrder);

  const items = categories.length
    ? await db
        .select()
        .from(menuItems)
        .where(inArray(menuItems.categoryId, categories.map((category) => category.id)))
    : [];

  return (
    <>
      <PortalTopBar businessName={business.name} />
      <div className="admin-page">
        <h1>Your menu</h1>
        <p className="admin-page-intro">
          Changes here go live immediately on your public menu page — no need to contact Seagull Trading.
        </p>
        <PortalBusinessForm business={business} />
        <MenuEditor businessId={business.id} categories={categories} items={items} />
      </div>
    </>
  );
}
