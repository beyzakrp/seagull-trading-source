import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "../../auth/session";
import { getDb } from "../../db";
import { businesses } from "../../db/schema";
import { AdminTopBar } from "../components/admin/AdminTopBar";
import { CreateBusinessForm } from "../components/admin/CreateBusinessForm";
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "../components/admin/ui/Table";

export const metadata: Metadata = { title: "Admin | Seagull Trading" };

export default async function AdminDashboardPage() {
  await requireAdmin();

  const db = await getDb();
  const allBusinesses = await db.select().from(businesses).orderBy(businesses.name);

  return (
    <>
      <AdminTopBar />
      <div className="admin-page">
        <h1>Businesses</h1>
        {allBusinesses.length === 0 ? (
          <p className="admin-empty">No businesses yet — add the first one below.</p>
        ) : (
          <Table>
            <TableHead>
              <TableHeaderCell>Business</TableHeaderCell>
              <TableHeaderCell>Menu URL</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell />
            </TableHead>
            <TableBody>
              {allBusinesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell><strong>{business.name}</strong></TableCell>
                  <TableCell>/menu/{business.slug}</TableCell>
                  <TableCell>{business.location ?? "—"}</TableCell>
                  <TableCell>
                    <Link href={`/admin/businesses/${business.id}`} className="ui-btn ui-btn-ghost ui-btn-sm">
                      Manage →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <h2>Add a business</h2>
        <CreateBusinessForm />
      </div>
    </>
  );
}
