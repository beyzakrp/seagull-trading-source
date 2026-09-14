import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { admins } from "../db/schema";
import { verifyPassword } from "./password";

export type VerifiedLogin = { id: number; role: "staff" | "business_owner"; businessId: number | null };

// Always returns a generic outcome — never reveals whether the username
// existed (see CLAUDE.md, Tech Stack → Auth). Returns the account's role so
// callers (admin login vs. portal login) can reject a login attempted on
// the wrong surface.
export async function verifyLogin(username: string, password: string): Promise<VerifiedLogin | null> {
  const db = await getDb();
  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.username, username.trim().toLowerCase()))
    .limit(1);

  if (!admin) {
    // Still do a dummy PBKDF2 pass so a nonexistent-username response takes
    // roughly the same time as a wrong-password one (timing side channel).
    await verifyPassword(password, {
      hash: "0".repeat(64),
      salt: "00".repeat(16),
      iterations: 600_000,
      algo: "pbkdf2-sha256",
    });
    return null;
  }

  const valid = await verifyPassword(password, {
    hash: admin.passwordHash,
    salt: admin.passwordSalt,
    iterations: admin.passwordIterations,
    algo: admin.passwordAlgo,
  });

  return valid ? { id: admin.id, role: admin.role as "staff" | "business_owner", businessId: admin.businessId } : null;
}
