import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "../db";
import { admins, sessions } from "../db/schema";
import { toHex } from "./encoding";

const COOKIE_NAME = "admin_session";
const SESSION_DAYS = 7;

// One login table, two roles: 'staff' (Seagull, access to everything) and
// 'business_owner' (scoped to exactly one business). See db/schema.ts and
// CLAUDE.md, Tech Stack → Auth.
export type AdminAccount = {
  id: number;
  username: string;
  role: "staff" | "business_owner";
  businessId: number | null;
};

function randomToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toHex(new Uint8Array(digest));
}

// Called after a verified username/password check. Issues a fresh session
// (never reuses/extends an old one) and sets the cookie.
export async function createSession(adminId: number): Promise<void> {
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  const db = await getDb();
  await db.insert(sessions).values({
    tokenHash,
    adminId,
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Returns the logged-in account (staff or business_owner), or null. Does
// not redirect — use this when an anonymous visitor is a normal case (e.g.
// deciding what a login page itself should render). Use requireAdmin() /
// requireBusinessOwner() / requireBusinessAccess() everywhere a session is
// actually required.
export async function getSession(): Promise<AdminAccount | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = await sha256Hex(token);
  const db = await getDb();
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);

  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
    return null;
  }

  const [admin] = await db
    .select({ id: admins.id, username: admins.username, role: admins.role, businessId: admins.businessId })
    .from(admins)
    .where(eq(admins.id, session.adminId))
    .limit(1);

  return (admin as AdminAccount) ?? null;
}

// Staff-only boundary — call at the top of every Server Action and every
// server-side data read under /admin/* (proxy.ts is only a first gate, see
// CLAUDE.md, Coding Rules → Security). A business_owner session is valid
// but wrong here: send them to their own area instead of bouncing them back
// through /admin/login (which would just redirect them right back and loop).
export async function requireAdmin(): Promise<AdminAccount> {
  const account = await getSession();
  if (!account) redirect("/admin/login");
  if (account.role !== "staff") redirect("/portal");
  return account;
}

// Business-owner-only boundary — call at the top of /portal pages.
export async function requireBusinessOwner(): Promise<AdminAccount & { businessId: number }> {
  const account = await getSession();
  if (!account) redirect("/portal/login");
  if (account.role !== "business_owner" || account.businessId === null) redirect("/admin");
  return account as AdminAccount & { businessId: number };
}

// Shared boundary for menu-editing Server Actions that both staff and a
// business's own owner may call (add/edit/delete category or item, update
// business details). Staff can touch any business; a business_owner may
// only touch their own. Throws rather than redirecting — this runs inside
// Server Actions invoked from either /admin or /portal, so there's no
// single "right" login page to send an unauthorized caller to; the page
// itself already gated access before this action could ever be reached.
export async function requireBusinessAccess(businessId: number): Promise<AdminAccount> {
  const account = await getSession();
  if (!account) redirect("/admin/login");
  if (account.role === "staff") return account;
  if (account.role === "business_owner" && account.businessId === businessId) return account;
  throw new Error("Not authorized for this business.");
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = await sha256Hex(token);
    const db = await getDb();
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }
  cookieStore.delete(COOKIE_NAME);
}
