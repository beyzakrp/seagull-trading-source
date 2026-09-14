import Link from "next/link";
import { logoutAction } from "../../admin/actions";
import { Button } from "./ui/Button";

export function AdminTopBar() {
  return (
    <div className="admin-topbar">
      <Link href="/admin" className="admin-topbar-brand">Seagull Admin</Link>
      <nav className="admin-topbar-nav">
        <Link href="/admin">Businesses</Link>
        <Link href="/admin/qr-codes">QR Codes</Link>
      </nav>
      <form action={logoutAction}>
        <Button type="submit" variant="topbar" size="sm">Log out</Button>
      </form>
    </div>
  );
}
