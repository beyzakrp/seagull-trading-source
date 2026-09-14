import { getDb } from "../db";
import { admins } from "../db/schema";
import { hashPassword } from "./password";
import { USERNAME_PATTERN, USERNAME_RULE_MESSAGE } from "./username";

export async function hasAnyAdmin(): Promise<boolean> {
  const db = await getDb();
  const [row] = await db.select({ id: admins.id }).from(admins).limit(1);
  return Boolean(row);
}

// Only succeeds once — the moment any admin row exists, this refuses. This
// always creates a 'staff' account; a business_owner login is created by
// staff from the business detail page (see app/admin/business-actions.ts
// createBusinessOwnerAction), never through this bootstrap path.
export async function createFirstAdminAccount(
  username: string,
  password: string,
): Promise<{ id: number } | { error: string }> {
  if (await hasAnyAdmin()) {
    return { error: "An admin account already exists." };
  }

  const normalized = username.trim().toLowerCase();
  if (!USERNAME_PATTERN.test(normalized)) {
    return { error: USERNAME_RULE_MESSAGE };
  }
  if (password.length < 10) {
    return { error: "Password must be at least 10 characters." };
  }

  const stored = await hashPassword(password);
  const db = await getDb();
  const [admin] = await db
    .insert(admins)
    .values({
      username: normalized,
      passwordHash: stored.hash,
      passwordSalt: stored.salt,
      passwordIterations: stored.iterations,
      passwordAlgo: stored.algo,
      role: "staff",
    })
    .returning({ id: admins.id });

  return { id: admin.id };
}
