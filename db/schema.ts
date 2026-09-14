import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Both Seagull staff and business-owner (portal) logins live in this one
// table and reuse the same password/session machinery — 'role' is what
// separates them. 'staff' can access every business; 'business_owner' is
// scoped to exactly one business via businessId (see auth/session.ts
// requireAdmin() / requireBusinessOwner() / requireBusinessAccess()).
export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  passwordIterations: integer("password_iterations").notNull(),
  passwordAlgo: text("password_algo").notNull().default("pbkdf2-sha256"),
  role: text("role").notNull().default("staff"), // 'staff' | 'business_owner'
  businessId: integer("business_id").references(() => businesses.id), // set only for role='business_owner'
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(), // hash of the cookie value, never the raw token
  adminId: integer("admin_id").notNull().references(() => admins.id),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const businesses = sqliteTable("businesses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(), // nice/readable URL: /menu/[slug]
  name: text("name").notNull(),
  location: text("location"),
  languages: text("languages").notNull().default('["EN"]'), // JSON array
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// A QR code is a sellable physical product, not just a link generator. It
// exists independently of a business — printed and put "in stock" before
// it's ever sold or assigned. `number` (not the internal `id`) is what's
// printed/encoded, kept as its own field so it can outlive row deletion,
// support non-sequential/reprinted codes, or a future format like
// "SG-000124" without a schema change.
//
// Invariants enforced in application code (see lib/qr-codes.ts), not by the
// database:
//   status = 'unassigned'  <=>  businessId IS NULL
//   status = 'active'      =>   businessId IS NOT NULL
//   status = 'inactive'    ->   either; means "temporarily disabled", the
//                                business link is kept so it can reactivate
export const qrCodes = sqliteTable("qr_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: text("number").notNull().unique(), // what's on the physical code, e.g. "000042"
  businessId: integer("business_id").references(() => businesses.id),
  status: text("status").notNull().default("unassigned"), // 'unassigned' | 'active' | 'inactive'
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  assignedAt: text("assigned_at"),
});

export const menuCategories = sqliteTable("menu_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const menuItems = sqliteTable("menu_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id").notNull().references(() => menuCategories.id),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  priceMinor: integer("price_minor").notNull(), // e.g. 1250 = 12.50, avoids float rounding
  currency: text("currency").notNull().default("EUR"),
  isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  imageKey: text("image_key"), // R2 object key; served via /api/images/[...key]
});
