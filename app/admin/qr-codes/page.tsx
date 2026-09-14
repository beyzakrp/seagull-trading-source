import type { Metadata } from "next";
import { headers } from "next/headers";
import { requireAdmin } from "../../../auth/session";
import { getDb } from "../../../db";
import { businesses, qrCodes } from "../../../db/schema";
import { AdminTopBar } from "../../components/admin/AdminTopBar";
import { QrCodeSvg } from "../../components/admin/QrCodeSvg";
import { Badge, type BadgeTone } from "../../components/admin/ui/Badge";
import { Button } from "../../components/admin/ui/Button";
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "../../components/admin/ui/Table";
import { generateQrCodeAction, assignQrCodeAction, unassignQrCodeAction, toggleQrCodeStatusAction } from "../../admin/qr-actions";

export const metadata: Metadata = { title: "QR codes | Seagull Trading" };

const STATUS_TONE: Record<string, BadgeTone> = {
  active: "success",
  inactive: "danger",
  unassigned: "neutral",
};

async function getPublicOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:5173";
  const proto = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function QrCodesPage() {
  await requireAdmin();

  const db = await getDb();
  const [allQrCodes, allBusinesses, origin] = await Promise.all([
    db.select().from(qrCodes).orderBy(qrCodes.id),
    db.select().from(businesses).orderBy(businesses.name),
    getPublicOrigin(),
  ]);
  const businessById = new Map(allBusinesses.map((business) => [business.id, business]));

  return (
    <>
      <AdminTopBar />
      <div className="admin-page">
        <h1>QR codes</h1>
        <p className="admin-page-intro">
          Every QR code is a physical, sellable product with its own number, independent of any business — generate
          numbers ahead of printing, then assign each one when it's sold to a client.
        </p>

        <form action={generateQrCodeAction} className="admin-inline-form">
          <Button type="submit">Generate new QR number</Button>
        </form>

        {allQrCodes.length === 0 ? (
          <p className="admin-empty">No QR codes yet — generate the first one above.</p>
        ) : (
          <Table>
            <TableHead>
              <TableHeaderCell>QR</TableHeaderCell>
              <TableHeaderCell>Number</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Business</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableHead>
            <TableBody>
              {allQrCodes.map((qr) => {
                const business = qr.businessId ? businessById.get(qr.businessId) : null;
                const targetUrl = `${origin}/q/${qr.number}`;
                return (
                  <TableRow key={qr.id}>
                    <TableCell>
                      <div className="admin-qr-thumb">
                        <QrCodeSvg value={targetUrl} cellSize={2} />
                      </div>
                    </TableCell>
                    <TableCell><strong>#{qr.number}</strong></TableCell>
                    <TableCell>
                      <Badge tone={STATUS_TONE[qr.status]}>{qr.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {business ? (
                        <a href={`/admin/businesses/${business.id}`}>{business.name}</a>
                      ) : (
                        <span className="admin-muted">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!business && (
                        <form action={assignQrCodeAction.bind(null, qr.id)} className="admin-inline-form admin-qr-assign">
                          <select name="businessId" required defaultValue="">
                            <option value="" disabled>Assign to…</option>
                            {allBusinesses.map((b) => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                          <Button type="submit" size="sm">Assign</Button>
                        </form>
                      )}
                      {business && (
                        <div className="admin-row-actions">
                          <form action={toggleQrCodeStatusAction.bind(null, qr.id, qr.status)} className="admin-inline-form">
                            <Button type="submit" variant="ghost" size="sm">
                              {qr.status === "active" ? "Mark inactive" : "Mark active"}
                            </Button>
                          </form>
                          <form action={unassignQrCodeAction.bind(null, qr.id)} className="admin-inline-form">
                            <Button type="submit" variant="danger" size="sm">Unassign</Button>
                          </form>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
