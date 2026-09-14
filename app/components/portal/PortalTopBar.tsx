import { logoutAction } from "../../admin/actions";
import { Button } from "../admin/ui/Button";

export function PortalTopBar({ businessName }: { businessName: string }) {
  return (
    <div className="admin-topbar">
      <span className="admin-topbar-brand">{businessName} · Menu Portal</span>
      <form action={logoutAction}>
        <Button type="submit" variant="topbar" size="sm">Log out</Button>
      </form>
    </div>
  );
}
