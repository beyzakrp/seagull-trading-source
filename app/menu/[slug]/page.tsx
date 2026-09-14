import type { Metadata } from "next";
import Image from "next/image";
import { and, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../../db";
import { businesses, menuCategories, menuItems } from "../../../db/schema";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const [business] = await db.select({ name: businesses.name }).from(businesses).where(eq(businesses.slug, slug)).limit(1);
  return { title: business ? `${business.name} | Menu` : "Menu | Seagull Trading" };
}

function formatPrice(minor: number, currency: string): string {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

export default async function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const db = await getDb();
  const [business] = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
  if (!business) notFound();

  const categories = await db
    .select()
    .from(menuCategories)
    .where(and(eq(menuCategories.businessId, business.id), eq(menuCategories.isActive, true)))
    .orderBy(menuCategories.sortOrder);

  const items = categories.length
    ? await db
        .select()
        .from(menuItems)
        .where(and(inArray(menuItems.categoryId, categories.map((category) => category.id)), eq(menuItems.isAvailable, true)))
        .orderBy(menuItems.sortOrder)
    : [];

  return (
    <div className="public-menu-page">
      <header className="public-menu-header">
        <Image src="/seagull-blue-black.svg" alt="" width={80} height={46} unoptimized />
      </header>
      <main className="public-menu-content">
        {business.location && <p className="public-menu-location">{business.location}</p>}
        <h1>{business.name}</h1>

        {categories.length === 0 && <p className="public-menu-empty">This menu isn't published yet — check back soon.</p>}

        {categories.map((category) => {
          const categoryItems = items.filter((item) => item.categoryId === category.id);
          if (categoryItems.length === 0) return null;
          return (
            <section key={category.id} className="public-menu-category">
              <h2>{category.name}</h2>
              <ul>
                {categoryItems.map((item) => (
                  <li key={item.id}>
                    <div className="public-menu-item-main">
                      {item.imageKey && (
                        // eslint-disable-next-line @next/next/no-img-element -- R2-served, not a next/image-optimizable static asset
                        <img src={`/api/images/${item.imageKey}`} alt="" className="public-menu-item-photo" />
                      )}
                      <div>
                        <strong>{item.name}</strong>
                        {item.description && <p>{item.description}</p>}
                      </div>
                    </div>
                    <span>{formatPrice(item.priceMinor, item.currency)}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
      <footer className="public-menu-footer">
        <span>Powered by Seagull Trading</span>
      </footer>
    </div>
  );
}
