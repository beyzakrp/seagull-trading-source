import { NextRequest, NextResponse } from "next/server";

// First gate only — a cheap "is there even a session cookie" check so a
// logged-out visitor gets redirected before rendering anything under
// /admin/* or /portal/*. This is NOT the authorization boundary: it never
// touches the database, so it can't tell a valid session from a
// stale/forged cookie, and it can't tell staff from a business owner.
// Every Server Action and server-side data read must still call
// requireAdmin() / requireBusinessOwner() / requireBusinessAccess() itself
// (see CLAUDE.md, Coding Rules → Security).
const SESSION_COOKIE = "admin_session";
const PUBLIC_PATHS = new Set(["/admin/login", "/admin/setup", "/portal/login"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const loginPath = pathname.startsWith("/portal") ? "/portal/login" : "/admin/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
