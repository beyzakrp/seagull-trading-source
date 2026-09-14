import type { Metadata } from "next";
import Image from "next/image";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getDb } from "../../../db";
import { businesses, qrCodes } from "../../../db/schema";

export const metadata: Metadata = { title: "Menu | Seagull Trading" };

function StatusPage({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="public-menu-page">
      <header className="public-menu-header">
        <Image src="/seagull-blue-black.svg" alt="" width={80} height={46} unoptimized />
      </header>
      <main className="public-menu-content public-menu-status">
        <h1>{title}</h1>
        <p>{copy}</p>
      </main>
    </div>
  );
}

export default async function QrResolverPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;

  const db = await getDb();
  const [qr] = await db.select().from(qrCodes).where(eq(qrCodes.number, number)).limit(1);
  if (!qr) notFound();

  if (qr.status === "unassigned") {
    return <StatusPage title="Not active yet" copy="This QR code hasn't been set up with a menu yet. Please check back soon." />;
  }
  if (qr.status === "inactive") {
    return <StatusPage title="Menu temporarily unavailable" copy="This menu is temporarily unavailable. Please ask a member of staff." />;
  }

  if (!qr.businessId) notFound();
  const [business] = await db.select({ slug: businesses.slug }).from(businesses).where(eq(businesses.id, qr.businessId)).limit(1);
  if (!business) notFound();

  redirect(`/menu/${business.slug}`);
}
