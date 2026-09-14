# CLAUDE.md — Seagull Trading: QR Menu Management Panel

This file is project-specific context for whoever (human or Claude) works on the
**QR Menu Management Panel** feature in this repo. Read it before touching
`/admin`, `/menu/[slug]`, or `db/`. Keep it up to date — especially the Memory
section at the bottom — as decisions get made.

## Project Overview

Seagull Trading is a Montenegro-based digital agency marketing site (Next.js
App Router, served via `vinext` on Cloudflare Workers). It currently *markets*
a "QR menu" service on the public `/qr-menu` page using hardcoded demo data
(`app/components/PhoneMenu.tsx`, the "Bay House · Kotor" example).

This phase turns that sales pitch into a real, working product: a
password-protected **admin panel** where Seagull Trading staff manage QR
menus for their actual client businesses.

**Who uses what:**
- **Seagull staff** log into `/admin` (username + password) and manage
  *every* client business: create a business, build its menu (categories →
  items), get a QR code that links to that business's public menu page,
  and provision that business's own portal login.
- **A business owner** logs into `/portal` (their own username + password,
  created by staff from `/admin/businesses/[id]`) and can edit *only their
  own* menu — categories, items, name, location. They cannot see other
  businesses, cannot change their own URL slug, and have no access to QR
  code management (QR inventory stays a Seagull-only concern). See *Tech
  Stack → Auth* for how one login table serves both roles.
- **Diners** never log in. They scan a QR code, land on a public page
  (`/menu/[slug]`), and see the current menu. No app, no account — this must
  stay true, it's the whole point of the product.

**This is multi-tenant with two kinds of authenticated user.** Seagull
Trading is the operator with access to everything; each client business is
both a row of data *and*, optionally, its own scoped login. A business only
gets a portal login if staff creates one for it — there's no self-registration.

**QR codes are a physical, sellable product — not just a UI feature.** Each
QR code has its own unique numeric ID, independent of any business (a QR can
exist unassigned/in stock before it's sold and linked to a client). The
panel must show, at a glance, which QR number maps to which business. The
public URL encoded on the physical QR is number-based (`/q/[number]`), not
business-based — see *Tech Stack* for why and how that resolves to a menu.

**Explicitly out of scope for now** (don't build unless asked): a business
owner creating/resetting their own portal password (staff sets it and
shares it out-of-band), billing, true
per-item translated content (the UI already shows EN/ME/TR language pills as
a demo — real multilingual fields are a stretch goal), analytics/scan
tracking, a business having more than one portal login.

The existing `/qr-menu` marketing page is untouched by this work — it stays
exactly as the sales demo it already is. The real product lives entirely
under `/admin/*` and `/menu/[slug]`.

## Tech Stack

**Framework & runtime.** Next.js 16 App Router via `vinext`, deployed to
Cloudflare Workers (`workerd`), not a Node server. Stick to Web-standard APIs
(`fetch`, `crypto.subtle`, `Request`/`Response`) — avoid Node-only native
modules unless covered by the `nodejs_compat` flag already set in
`vite.config.ts`.

**UI.** React 19, plain hand-written CSS in `app/globals.css` using the
site's existing design tokens (`--navy`, `--blue`, `--sea`, `--ivory`, etc.).
Tailwind is installed (`@import "tailwindcss";` in `globals.css`) but **not
actually used anywhere** — don't introduce Tailwind utility classes; add new
rules to `globals.css` the same way the rest of the site does.

**Database: Cloudflare D1 (SQLite via Drizzle) — not the MySQL originally
proposed.** See *Memory* below for why. The scaffolding already exists:
- `db/schema.ts` — Drizzle table definitions (`drizzle-orm/sqlite-core`)
- `db/index.ts` — `getDb()` reads the `DB` binding from `env` (imported from
  `cloudflare:workers`)
- `drizzle.config.ts` — `dialect: "sqlite"`, migrations output to `./drizzle/`
- `examples/d1/` — a working notes CRUD example already in the repo. Copy its
  patterns (route handler shape, error messages, `getDb()` usage) rather than
  inventing a new data-access style.

**Local dev needs no external database at all.** `vite.config.ts` builds the
`d1_databases` Miniflare binding from `.openai/hosting.json`'s `"d1"` field.
It's currently `null` (stubbed earlier just to get `npm run dev` running
without any binding). **Before building this feature, set `"d1": "DB"`** in
`.openai/hosting.json` — Cloudflare's Vite plugin then emulates D1 locally
for free, and `env.DB` resolves in `npm run dev`.

**Production database.** This project deploys through an OpenAI "Sites"
hosting platform, not a raw `wrangler deploy` (`README.md` notes "This
starter does not use `wrangler.jsonc`"). Standard D1 behavior is: Drizzle
*generates* migration files, but *applying* them normally requires an
explicit `wrangler d1 migrations apply` step — D1 does not auto-apply on its
own. The error message already written in
`examples/d1/app/api/notes/route.ts` implies this platform's own deploy
pipeline does that step for you, but that's this platform's behavior, not a
general D1 guarantee. Workflow: run `npm run db:generate` to generate SQL
migrations from `db/schema.ts`, commit the generated files, deploy, then
**verify on the first real preview/production deploy that the tables
actually exist** before assuming migrations applied automatically. Never
hand-run SQL against production.

**Auth.** No auth library — Web Crypto only (native to the Workers runtime,
zero dependencies). **One `admins` table and one session mechanism serve
both Seagull staff and business-owner (portal) logins** — `role` ('staff' |
'business_owner') is what tells them apart, plus `businessId` (set only for
`business_owner`). Don't build a second, parallel auth system for the
portal; extend this one. Three authorization boundaries in
`auth/session.ts`, all built on the same `getSession()`:
- `requireAdmin()` — staff-only (used by every `/admin/*` page).
- `requireBusinessOwner()` — business-owner-only (used by `/portal`).
- `requireBusinessAccess(businessId)` — either staff (any business) or the
  matching business_owner; used inside the Server Actions that both
  `/admin/businesses/[id]` and `/portal` call to edit a menu (see
  `app/components/MenuEditor.tsx`, shared by both surfaces). Throws rather
  than redirecting — it runs inside actions reachable from either surface,
  so there's no single correct login page to bounce an unauthorized caller
  to; the calling page already gated access before the action could fire.

Be explicit about the password parameters, not just "PBKDF2":
- A unique salt per password, generated with `crypto.getRandomValues()`.
- PBKDF2-HMAC-SHA-256. OWASP currently recommends 600,000 iterations for
  this combination — treat that as the starting point, but **measure actual
  CPU time on this Workers runtime** before locking in a number; don't
  silently pick something lower just because it's untested.
- Store the iteration count and an algorithm/version tag alongside the salt
  and hash (`admins.password_hash`, `.password_salt`, `.password_iterations`,
  `.password_algo`) so the scheme can be upgraded later without breaking
  existing accounts.
- Sessions are DB-backed (a `sessions` table). The cookie holds a random
  token; **store a hash of that token in the DB, not the raw token** — a DB
  read alone should never be enough to impersonate a session.
- Sessions have `expires_at`; login rotates/creates a fresh session, logout
  deletes the DB row (not just the cookie).
- Cookie: `httpOnly`, `secure`, `sameSite: "lax"` (or `"strict"`), `path:
  "/"`, set via `next/headers`'s `cookies()`.
- Failed login returns a generic "invalid username or password" — never
  reveal whether the username exists — and should be rate-limited (or at
  least back off) per IP + username combination.

**Route protection.** `proxy.ts` is the current vinext/Next.js 16 file
convention for this (vinext also runs the older `middleware.ts` name, but
there's no reason to start a new file on the deprecated one). Matcher
patterns, `next/server` — gate everything under `/admin/*` except
`/admin/login`. **This is only the first gate, not the security boundary —
see Coding Rules.**

**Mutations.** Prefer **Server Actions** (`"use server"`, supported by
vinext) for panel CRUD over hand-rolled `fetch` + API routes — less client
JS, and it's a step up from `ContactForm.tsx`'s current client-side
`mailto:` redirect, which is fine for a contact form but not how real data
mutations should work.

**QR codes.** Use `qrcode-generator` (tiny, dependency-free, pure JS) to
render an inline SVG server-side from the business's public URL. Avoid
`qrcode`/`node-qrcode` or anything with canvas/native bindings — those don't
belong in a Workers runtime.

**Suggested schema sketch** (adjust as needed, but this is the shape):

```ts
// db/schema.ts
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Both Seagull staff and business-owner (portal) logins live here — 'role'
// is what separates them. 'staff' can access every business; 'business_owner'
// is scoped to exactly one business via businessId.
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

// A QR code is a sellable physical product, not just a link generator.
// It exists independently of a business — printed and put "in stock"
// before it's ever sold or assigned. `number` (not the internal `id`) is
// what's printed/encoded — kept as its own text field so it can outlive
// row deletion, support non-sequential/reprinted codes, or a future format
// like "SG-000124" without a schema change.
export const qrCodes = sqliteTable("qr_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: text("number").notNull().unique(), // what's on the physical code, e.g. "000042"
  businessId: integer("business_id").references(() => businesses.id), // null = unassigned/in stock
  status: text("status").notNull().default("unassigned"), // 'unassigned' | 'active' | 'inactive'
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  assignedAt: text("assigned_at"), // set when linked to a business
});
// Enforce in application code (Server Actions), not just at read time:
//   status = 'unassigned'  ⇔  businessId IS NULL
//   status = 'active'      ⇒  businessId IS NOT NULL
//   status = 'inactive'    → either; means "temporarily disabled", business
//                              link is kept so it can be reactivated later

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
```

**Item photos (R2).** `.openai/hosting.json`'s `"r2"` field is set to
`"MENU_IMAGES"` (same enable-a-binding pattern as D1 — `vite.config.ts`
already conditionally builds `r2_buckets` from this field, no code change
needed there). `storage/r2.ts`'s `getBucket()` follows the exact same
lazy-`import("cloudflare:workers")` pattern as `db/index.ts`, for the same
reason (see Coding Rules). Upload/remove live in
`app/admin/image-actions.ts` (`uploadItemImageAction`,
`removeItemImageAction`), authorized via the same `requireBusinessAccess()`
as every other menu-editing action — staff or the matching business owner
can attach a photo. Images are served publicly (no auth) at
`/api/images/[...key]` (catch-all segment because keys are namespaced,
e.g. `menu-items/42-1785841652552.jpg`) with a long immutable
`Cache-Control`, since every upload gets a fresh key rather than
overwriting one in place. Validated server-side: JPEG/PNG/WebP only, 4MB
max. No resizing/optimization — deliberately out of scope, see Coding Rules.

Uniqueness (`username`, `businesses.slug`, `qr_codes.number`) is enforced at
the schema level with `.unique()` above — that's a DB constraint, not just
an application-level check. Keep it that way for every field that must be
unique; don't rely on "we'll check before inserting" alone.

**`/q/[number]` and `/menu/[slug]` behavior — define this explicitly, don't
leave it implicit:**
| Route | Case | Result |
|---|---|---|
| `/q/[number]` | number not found | 404 |
| `/q/[number]` | `status: unassigned` | "This QR isn't active yet" page |
| `/q/[number]` | `status: inactive` | "This menu is temporarily unavailable" page |
| `/q/[number]` | `status: active` | shows/redirects to that business's menu |
| `/menu/[slug]` | business found, active | the menu |
| `/menu/[slug]` | not found | 404 |

The point of splitting `/q/[number]` from `/menu/[slug]`: a business's slug
can change (rename, rebrand) without reprinting the physical QR code — only
the `qr_codes.business_id` link needs to stay correct.

**Routes to build:**
| Route | Type | Purpose |
|---|---|---|
| `/admin/login` | public | Username/password form |
| `/admin` | protected | List of businesses, "add new" |
| `/admin/businesses/[id]` | protected | Edit one business: categories, items, QR download |
| `/admin/qr-codes` | protected (staff) | Table of all QR numbers ↔ assigned business ↔ status; generate new (unassigned) numbers; assign an existing number to a business |
| `/portal/login` | public | Business-owner login form |
| `/portal` | protected (business_owner) | Edit *only your own* business: name, location, categories, items. No slug, no QR codes, no other businesses. |
| `/menu/[slug]` | public | Live menu at a readable, business-branded URL |
| `/q/[number]` | public | What's physically printed on the QR code. Looks up `qr_codes.number` → `business_id` → shows that business's menu. See the state table below for every case. |

No new frontend framework, state library, or ORM beyond what's listed above.

## Coding Rules

- Match conventions already established in this codebase:
  - Pages are Server Components by default; only leaf components that need
    interactivity get `"use client"` (see `Header.tsx`, `WorkGrid.tsx`,
    `PhoneMenu.tsx`, `Reveal.tsx` for the pattern). Keep the client boundary
    as small as it can be *without fighting the framework* — e.g. a nav
    whose active-link highlighting depends on the current path needs
    `usePathname()` client-side (there's no clean server-side equivalent in
    App Router layouts), so don't force-split something like `Header.tsx`
    into server/client pieces just for the sake of it. Do split out a truly
    static sub-part (a logo, a footer link list) if one naturally exists.
  - Shared UI lives in `app/components/`, one component per file, named
    exports.
  - No Tailwind utility classes, and no CSS Modules either — every other
    page in this repo uses one global `app/globals.css` with plain class
    names, and introducing a second styling system just for `/admin/*`
    would make the codebase inconsistent for no real benefit. Instead,
    **namespace admin-only classes** under an `.admin-` prefix (or scope
    them under a single `.admin-panel` wrapper class) to avoid collisions
    with marketing-page classes, while still reusing the same CSS
    variables/tokens (`--navy`, `--blue`, etc.) for color and type.
  - **UI kit: `app/components/admin/ui/` (`Button`, `Badge`, `Card`,
    `Table`/`TableHead`/`TableRow`/`TableCell`).** Every admin/portal button,
    status label, card and data list goes through these instead of ad-hoc
    `<button className="...">` or hand-rolled div grids — that's what makes
    the panel read as one consistent system rather than a pile of forms
    (see Memory for why a shadcn/HeroUI-style component library was
    considered and rejected). They're plain presentational wrappers with no
    hooks, so they stay Server Components; styled via `.ui-*` classes in
    `globals.css` using the site's existing tokens, zero new dependencies.
    Extend this kit before reaching for a new one-off class.
  - **Still don't reuse the marketing site's animation components**
    (`Reveal`, `Magnetic`, `Cursor`, `Marquee`) inside `/admin/*` — that's a
    different, scroll/hero-driven animation vocabulary for a public page,
    not what an internal tool needs. The public `/menu/[slug]` and
    `/q/[number]` pages are the exception: they're diner-facing and can
    reuse the phone-menu visual language.
  - **Admin motion: the `motion` package (`motion/react`), not CSS-only.**
    This reverses the original "admin panel should feel fast and static,
    zero animation dependency" rule — see Memory (2026-08-11) for why. Rules
    for using it:
    - Spring presets live in `app/components/admin/ui/motion-config.ts`
      (`springs.snappy`/`gentle`/`momentum`, `fadeInUp`, `staggerContainer`)
      — reach for one of those before inventing new spring numbers, so the
      whole panel moves with one consistent feel (Apple's damping/response
      model: `bounce: 0` critically-damped by default, bounce only for
      something that was actually flicked/thrown, which nothing in this
      panel does today).
    - Any component using a `motion.*` primitive must be `"use client"` —
      `framer-motion` (which `motion/react` re-exports) ships **no**
      `"use client"` directives in its own build, so the boundary has to be
      established by the file that imports it, not inherited for free.
    - Reduced motion is handled **once**, globally, via `<MotionConfig
      reducedMotion="user">` in `app/admin/layout.tsx` and
      `app/portal/layout.tsx` (see `MotionProvider.tsx`) — individual
      components must not add their own `prefers-reduced-motion` checks:
      that would duplicate what `MotionConfig` already does for every
      descendant `motion.*` element.
    - Pages stay Server Components and keep fetching data server-side; only
      the leaf UI-kit components (`Button`, `Card`, `Table`, `Badge`,
      `DeleteButton`) became client components to host the motion. Don't let
      "we use Motion now" become an excuse to push data-fetching client-side
      — the RSC boundary discipline elsewhere in this file still applies.
  - Keep components small; don't build a generic `<DataTable>` or CMS
    abstraction for what is, in practice, five related tables. They don't
    need a plugin system.
- **Security — non-negotiable:**
  - `proxy.ts` is a first gate, not the authorization boundary. **Every
    Server Action and every server function that reads or writes admin data
    must independently call something like `requireAdmin()`/`getSession()`
    and check it.** A Server Action is a directly callable endpoint — it can
    be POSTed to without ever rendering the protected page, so page-level or
    proxy-level gating alone does not protect it. The fact that a component
    is only *rendered* inside `/admin/*` is not proof it's authorized.
  - **Tenant isolation:** every query or mutation that touches a
    business-scoped row (a menu category, a menu item, a QR assignment)
    must filter by `business_id` explicitly, not just by the row's own
    `id` — e.g. `WHERE id = ? AND business_id = ?`, never bare `WHERE id =
    ?`. The panel is single-tenant-operator today (only Seagull staff use
    it), but building this habit now costs nothing and is exactly what
    prevents data leaks if client self-service logins are ever added later.
  - Never commit real credentials, admin passwords, or session secrets.
    Local secrets go in `.dev.vars` or `.env.local` (already gitignored);
    read them via `env` from `cloudflare:workers`, not `process.env`.
  - Validate and sanitize all panel input server-side — Server Actions run
    server-side, but that doesn't mean the input is trustworthy.
  - See *Tech Stack → Auth* for the specific password-hashing and session
    parameters — "hash the password" alone is not a complete spec.
- **Data conventions (SQLite/Drizzle):** integer autoincrement IDs, booleans
  as `integer({ mode: "boolean" })`, timestamps as `text()` default
  `CURRENT_TIMESTAMP` — matches `examples/d1/db/schema.ts`. Every field that
  must be unique (`username`, `businesses.slug`, `qr_codes.number`) gets a
  DB-level `.unique()`, not just an application-level check before insert.
  `businesses.slug` is also validated for format (lowercase, hyphens, no
  spaces) before insert.
- **Verify, don't assume.** Run `npm run build` before calling a change done
  if it touches anything build-affecting, and run `vinext check` to catch
  known Next.js/vinext compatibility gaps early — vinext is under active
  development and doesn't claim 1:1 Next.js behavior everywhere. **For
  anything touching D1 (or any Cloudflare binding): verify it with `npm run
  dev`, not `npm run start`.** `npm run start` (`vinext start`) runs in
  plain Node.js — it does not emulate workerd/Miniflare, so `cloudflare:*`
  imports fail at runtime the moment a binding is actually used (confirmed:
  every D1-touching route 500s under `npm run start` while working fine
  under `npm run dev`). `npm run dev`, via `@cloudflare/vite-plugin`, is the
  only locally-available faithful emulation of the real Workers runtime —
  treat it as the trustworthy one for this project, not the "just dev
  server" fallback. `npm run start` is still useful for a quick routing/SSR
  smoke test of pages that don't touch any Cloudflare binding. Prefer
  checking behavior in the browser over trusting that code reading
  correctly means it works — this project's Workers/RSC setup has surprised
  us more than once (see Memory).
- **Never import `cloudflare:*` modules at the top level of a file that
  ends up in the app's route graph.** Use a dynamic `await
  import("cloudflare:workers")` inside the function that needs it (see
  `db/index.ts`). A top-level import makes `scripts/validate-artifact.sh`
  fail outright — that script does a plain Node `import()` of the built
  worker to sanity-check it exports `default.fetch`, and plain Node's ESM
  loader cannot resolve the `cloudflare:` URL scheme at all. Deferring the
  import means merely *loading* the module succeeds; only calling the
  function that needs the binding requires the real Workers runtime.
- **Only commit when explicitly asked.** Standing rule, repeated here since
  this file may be read on its own.

## Memory

*Running log of decisions and non-obvious facts. Add new entries at the top.
This is what keeps a new session from re-deriving — or re-arguing — things
that are already settled.*

- **2026-08-12 — Launch-readiness audit, ahead of taking the site live.**
  User asked directly whether the QR menu system is ready to launch. Did a
  real pass rather than asserting yes — read every "not verified"/"unresolved"
  note already in this file, live-tested the full staff → QR code → diner
  path in the browser (login, `/admin/qr-codes`, `/q/000001` → correctly
  redirects to `/menu/bay-house-kotor`, mobile viewport render of both the
  public menu and the marketing homepage's mobile nav), and grepped for
  things this file already said should exist but might not (rate limiting).
  **Found and fixed one real gap:** `/menu/[slug]` and `/q/[number]` — the
  actual diner-facing production traffic, i.e. exactly what's live the
  moment someone scans a physical QR code — had **no `error.tsx`**, unlike
  `/admin`/`/portal` which got that safety net back on 2026-08-07. Any
  unexpected error there (a transient D1 hiccup, bad data) would have shown
  Next's raw default crash screen to a diner mid-meal instead of anything
  graceful. Added `app/components/PublicErrorPanel.tsx` (deliberately
  separate from the admin `ErrorPanel` — must not import anything from the
  admin UI kit, since it renders on fully public traffic) plus
  `app/menu/[slug]/error.tsx` and `app/q/[number]/error.tsx`. Verified the
  menu page still renders correctly after adding it.
  **Real gaps found that are NOT fixed — need a decision, not more coding
  session time, before this counts as "ready":**
  1. **Production migration application is still unverified** (this file
     has said so since 2026-08-04 — re-flagging here so it doesn't get lost).
     This project deploys through an OpenAI "Sites" pipeline, not a manual
     `wrangler d1 migrations apply`. Standard D1 behavior does NOT
     auto-apply migrations; whether *this platform's* deploy pipeline does
     is assumed, not confirmed. **If it doesn't, the production D1 database
     has zero tables and every route that touches D1 — which is almost the
     entire product — 500s immediately on first real traffic.** This can
     only be resolved by actually deploying once and checking (e.g. hitting
     `/admin/setup` and seeing whether it works, or checking the businesses
     list is genuinely empty vs. erroring) — it cannot be verified from
     local dev, where Miniflare always emulates a working D1.
  2. **No rate limiting or backoff on `/admin/login` or `/portal/login`.**
     This file's own Tech Stack → Auth section has said "should be
     rate-limited (or at least back off) per IP + username" since this
     spec was first written — it was never implemented. Right now both
     login forms accept unlimited attempts. Not a blocker for a low-traffic
     internal tool the first day, but a real gap for anything public-facing
     long-term, and there's no existing rate-limiting infrastructure in
     this repo to build on (would need a KV namespace or a D1-backed
     attempt counter — a real, non-trivial addition, not a quick fix).
  3. **PBKDF2's 600,000 iterations still haven't been measured against real
     Cloudflare Workers CPU-time limits** — only against local Miniflare,
     which runs on this dev machine's CPU and isn't representative of the
     actual edge isolate. Measured today: a full login POST (verify +
     session create + DB round-trips) took ~300ms locally, which is a
     reassuring *local* signal but explicitly not the number this file has
     been asking for since 2026-08-04. Not urgent to block launch on, but
     don't assume it's fine just because local dev is fast — watch for
     login timeouts specifically after the first real deploy.
  **Also confirmed fine, so future sessions don't re-check these:** tenant
  isolation queries, the `qrcode-generator` SVG rendering, the
  business/portal dual-auth boundary, image upload/serving, and the delete
  confirmation flow — all exercised live in this pass with no errors.
  `.openai/hosting.json` has real binding names (`"d1": "DB"`, `"r2":
  "MENU_IMAGES"`), not the original `null` stubs — someone would notice
  immediately in dev if these regressed, so low risk, but worth confirming
  they survive to the deployed config too.
  **How to use this entry:** items 1–3 above are the actual launch
  blockers/risks, not the error.tsx fix (already done). Don't re-derive
  this list from scratch in a future session — decide on 1–3 first.

- **2026-08-12 — Extended the Apple-design pass to the marketing site**
  (previously admin/portal-only, see the two entries below), ahead of
  taking the site live. **Deliberately scoped narrowly to actual audit
  findings, not a redo** — the marketing site already had a strong,
  correctly-tiered typography system (large headings get negative tracking
  down to `-.055em` with sub-1.0 line-heights, small labels get positive
  tracking up to `.3em`, body copy has generous 1.6–1.8 leading — better
  tiered than the admin panel was before its own pass) and already had a
  translucent scroll-state header (`.site-header.is-scrolled { backdrop-filter:
  blur(16px); }`). No Motion/spring library was added here — that boundary
  stays admin/portal-only per the 2026-08-11 decision; everything below is
  plain CSS plus one small change to an existing component, keeping the
  marketing site's zero-extra-dependency posture intact.
  **Two real gaps found and fixed:**
  1. **No press (`:active`) feedback anywhere** — `.button`, `.header-cta`,
     `nav a`, `.contact-form button`, `.menu-toggle`, `.project-filters
     button` all had `:hover` but nothing for the instant a user actually
     presses, violating "respond on pointer-down, not on release." Added
     `:active` states (fast, ~50–80ms transitions, small scale-down) to all
     of them. **Non-obvious complication:** `.header-cta` and the two hero
     `.button`s are wrapped in `<Magnetic>`, which already owns that
     element's `transform` via direct `el.style.transform` writes on every
     `pointermove` — a plain CSS `:active` rule on those elements would be
     silently overridden by Magnetic's own inline style the instant the
     mouse moves during the press. Fixed by teaching `Magnetic.tsx` itself
     to track a `pressed` ref and compose `scale(0.96)` into the same
     inline transform string it already manages (`onPointerDown`/
     `onPointerUp`, mouse-only, matching its existing `pointerType !==
     "mouse"` guard) — so mouse users get press feedback from Magnetic's
     own transform, and keyboard/touch users (where Magnetic's mouse-only
     guard means it does nothing) fall back to the plain CSS `:active`
     rule. Both paths needed to exist; neither alone was sufficient.
  2. **`.public-menu-*` (the diner-facing page after scanning a QR code)
     had no size-tiered tracking/leading at all** — the one part of the
     non-admin CSS that had never gotten a typography pass (explicitly
     deferred as out-of-scope in the 2026-08-11 entry, at a time when the
     Apple-design work was still admin/portal-only). Added tight leading +
     negative tracking to its `h1`/`h2`, base `line-height: 1.5` on the
     page. Verified computed values in-browser (34px h1 → 37.4px line-height
     / -0.51px tracking; 20px h2 → 25px / -0.1px).
  **Not changed, on purpose:** the `.reveal`/`.hero-copy`/`.hero-visual`/
  `.project-card` CSS-keyframe entrance animations and the `.marquee`
  scroll loop — these aren't gesture-driven (nothing interrupts them via
  user input), so Apple's "avoid CSS transitions/keyframes, use springs"
  rule doesn't apply to them the way it does to Button/Card in the admin
  panel; they were already reduced-motion-covered by the existing blanket
  `@media (prefers-reduced-motion: reduce)` rule and didn't need touching.
  Also confirmed `Cursor.tsx` already does 1:1 direct-manipulation tracking
  correctly (raw `el.style.transform` per `pointermove`, no easing/lag) and
  already disables itself under `prefers-reduced-motion` and on non-`pointer:
  fine` devices — a good pre-existing example of the pattern, not a gap.
  **Verification:** `npm run build`/`npm run test` clean. Browser-verified:
  Magnetic press scale on the homepage hero button (`scale(0.965)` on
  pointerdown via real `PointerEvent` dispatch — confirmed the technique
  from the 2026-08-11 entry works here too), all five new `:active` CSS
  rules present and correctly parsed via `document.styleSheets` (JS-
  dispatched `mousedown`/`mouseup` do **not** trigger the browser's real
  `:active` pseudo-class — a hard automation-tool limitation, not something
  to "fix" — so the CSS itself was verified structurally instead of via a
  live pseudo-class toggle), public-menu typography computed values, and
  `/work`'s `.project-filters` buttons (also touched) rendering with no
  console errors.

- **2026-08-12 — Self-audited the 2026-08-11 Apple-design pass against the
  skill's own checklist (user asked "was everything redesigned per Apple
  design?"); found and fixed one real gap.** Most of the checklist was
  either satisfied (response-on-press, springs not CSS transitions for
  gesture feedback, materials/translucency with reduced-transparency
  fallbacks, spatial-consistency on the popover, size-tiered typography,
  sparing use of destructive confirmation) or not applicable (this panel has
  no drag/swipe/momentum surface at all — no sliders, no reorderable lists —
  so velocity handoff, momentum projection, and rubber-banding sections of
  the skill simply don't apply here; that's a scope fact, not a missed
  item). **The one real miss:** `addCategoryAction`/`addItemAction` still
  validated by `throw`-ing and relied on the `error.tsx` crash-backstop
  instead of an inline message — violates the skill's "validate inline, not
  on submit" rule, and was already flagged as a known gap in the
  2026-08-07 entry below ("the natural next step if that turns out to
  matter"). Fixed by converting both to the exact `FormActionState`/
  `useActionState` pattern already used elsewhere in this same file
  (`createBusinessAction`, `updateBusinessAction`, `createBusinessOwnerAction`,
  `loginAction`, `setupAction`) — not a new pattern, just applying the
  existing one consistently. `AddCategoryForm`/`AddItemForm` became client
  components; delete/toggle actions were deliberately left as-is (their
  `throw` paths are only reachable by tampering with bound IDs, not by
  normal user input, so the crash-backstop is proportionate there).
  Verified in-browser: submitting a non-numeric price now shows "Price must
  be a positive number." inline with the rest of the menu untouched (no
  console errors), and a valid submission still creates the item normally.
  **Unrelated environment discovery made while verifying this:** on this
  machine, `npm` itself (any subcommand, not just this project) started
  intermittently throwing `EPERM: operation not permitted, lstat
  'C:\Users\MSİ'` — the system-wide Node install at `C:\nvm4w\nodejs` is a
  symlink pointing at `C:\Users\MSİ\AppData\Local\nvm\v20.18.0` (a
  different/stale Windows profile path with the Turkish dotted-İ character),
  and Node's `resolveMainPath` chokes on realpath-ing through it for *any*
  npm-invoked script — `node -v`/`node -e` work fine, only script-file
  execution via `npm run ...` fails. This is a pre-existing OS/locale-level
  issue, not something this session's edits caused, and it's intermittent
  (earlier builds in the same session succeeded through the same path). The
  reliable workaround already existed in this repo for exactly this class of
  problem — the portable Node in `.tools/node-v22.23.1-win-x64` (see the
  "Node version" entry below) — but that was previously only documented for
  `npm install`/`npm run dev` via `run-dev.cmd`. **It applies equally to
  `npm run build`/`npm run test`:** prepend
  `.tools/node-v22.23.1-win-x64` to `PATH` before any npm command if plain
  `npm run build` fails with that specific `MSİ`/`EPERM` error — don't
  chase it as a code bug.

- **2026-08-11 — Applied Apple's fluid-interface design principles to
  `/admin` and `/portal` only, and installed a real spring library
  (`motion`) — an explicit, deliberate reversal of the "admin panel must be
  fast/static/zero-dependency" rule from 2026-08-04.** User invoked the
  Apple Design skill and, when asked to scope it, chose: (a) admin/portal
  panel only — the marketing site's animation system (`Reveal`, `Magnetic`,
  `Cursor`, `Marquee`) is untouched and this work doesn't reuse it; (b) add
  `motion` rather than staying CSS-only, specifically to get real
  interruptible, velocity-aware springs (Apple's WWDC 2018 "Designing Fluid
  Interfaces" model) instead of fixed-duration CSS transitions.
  **What changed, all in `app/components/admin/ui/`:**
  - New `motion-config.ts` — shared spring presets (`snappy`/`gentle`
    critically damped `bounce: 0`; `momentum` reserved for
    flick/drag-driven interactions, unused today since nothing in this
    panel is dragged) and shared `fadeInUp`/`staggerContainer` variants, so
    every component moves with one consistent feel instead of hand-tuned
    numbers per file.
  - New `MotionProvider.tsx` — a dedicated `"use client"` wrapper around
    `<MotionConfig reducedMotion="user">`, needed because `framer-motion`
    (which `motion/react` re-exports) ships **zero** `"use client"`
    directives in its own build (confirmed via grep across
    `node_modules/framer-motion/dist/es/*.mjs`) — `MotionConfig` can't be
    used directly from the still-Server-Component `admin/layout.tsx` /
    `portal/layout.tsx` without this boundary. Wired into both layouts;
    this is the single place reduced-motion is handled — no per-component
    `prefers-reduced-motion` checks anywhere else.
  - `Button` — became `motion.button` with `whileHover`/`whileTap` scale
    feedback (starts on press, per Apple's "respond on pointer-down, not
    release"). Verified the actual scale values render correctly
    (`scale(1.015)` on hover, `scale(0.96)` on press) — but only after
    discovering the browser automation tool's synthetic `pointerenter`/
    `pointerdown` dispatch needs the full native event set (`pointerover` +
    `pointerenter` + `mouseover` + `mouseenter`, not pointer events alone)
    to actually trigger Motion's gesture recognizers; the `computer` tool's
    real `hover` action worked once combined with that. If a future session
    sees `whileHover`/`whileTap` seemingly not firing in this browser
    automation harness, that's very likely a test-harness event-dispatch
    gap, not a Motion/Button bug — don't "fix" Button in response without
    re-checking with the full native event combo first.
  - `Card` and `TableRow` (via `TableBody` as the stagger orchestrator) —
    entrance animation using `fadeInUp`/`staggerContainer`; rows cascade in
    rather than popping at once. `Badge` — tone changes (e.g. toggling item
    availability) now cross-fade/pop via `AnimatePresence` keyed on `tone`,
    `initial={false}` so first mount doesn't double-animate against the
    Card/Row entrance already covering that.
  - `DeleteButton` — replaced `window.confirm()` with an in-context popover
    anchored to the trigger (`transform-origin` at the button, growing from
    it — Apple's spatial-consistency rule: a popover should visibly
    originate from what opened it), dismissible via click-outside or
    Escape. **Confirm is still a real `type="submit"` inside the original
    `<form action={action}>`** — only the confirm *UI* changed, the Server
    Action wiring is untouched, so this didn't need re-verifying against
    the security rules above.
  - `.admin-topbar` — `position: sticky` + `backdrop-filter: blur(20px)
    saturate(180%)` + `color-mix(in srgb, var(--navy) 80%, transparent)`
    instead of a flat opaque bar, with a soft drop-shadow instead of a hard
    1px border (Apple's "scroll edge effects, not hard dividers"). Falls
    back to opaque `var(--navy)` under `prefers-reduced-transparency:
    reduce`.
  - Typography: added a size-tiered `letter-spacing`/`line-height` pass
    scoped to `.admin-*`/`.ui-*` selectors only (large headings get tight
    leading + negative tracking, small labels get slight positive tracking,
    body copy got an explicit `line-height: 1.5` where it previously had
    none) — did **not** touch `.public-menu-*` typography, out of scope per
    the admin/portal-only decision.
  **Verification:** `npm run build` and `npm run test` both clean. Browser-
  verified in `npm run dev` (not `npm run start`, per the existing rule):
  Button hover/press scale values, Card/Table entrance settling to a clean
  rest state, Badge tone cross-fade on a real availability toggle, delete
  popover open/cancel with real DOM content, sticky translucent topbar
  computed styles, and typography computed values at two size tiers — all
  with zero console errors. **Not independently verified:** the OS-level
  `prefers-reduced-motion: reduce` branch of `MotionConfig`
  `reducedMotion="user"` — the browser automation tool used this session
  has no way to force that media feature, so this is verified by API
  correctness (it's Motion's documented, well-established mechanism for
  exactly this) rather than by watching it live. If reduced-motion behavior
  is ever in question, that's the untested seam — start there.

- **2026-08-07 — Fixed the exact bug the "not verified" note below warned
  about: uploading a photo could take down the whole business/portal page.**
  User report: "I added the photo but then the menu doesn't show." Root
  cause: `uploadItemImageAction` validated the file (type/size) by
  `throw`-ing a plain `Error`, and `ItemImage`'s upload `<form>` called it
  directly (no `useActionState`) — so any validation failure hit Next's
  nearest error boundary, which unmounts the *entire* route segment, not
  just that form. A real-world trigger: iPhones default to HEIC for photos,
  which isn't in `ALLOWED_TYPES` (JPEG/PNG/WebP only, deliberately not
  expanded — HEIC needs actual transcoding to be browser-displayable, out
  of scope). Reproduced locally by simulating a file input via
  `DataTransfer` + `dispatchEvent("change")` — `form_input` can't drive a
  real `<input type="file">` (throws `InvalidStateError` if you try to set
  `.value` directly; the `DataTransfer` trick is the standard workaround
  used by browser test tooling and worked fine here).
  **Fix, two layers:**
  1. `uploadItemImageAction` now returns `{ error }` instead of throwing,
     and `ItemImage.tsx` became a client component using `useActionState`
     — a bad upload now shows a small inline message next to that item's
     photo control, the rest of the menu stays exactly as it was.
  2. Added `app/admin/error.tsx` and `app/portal/error.tsx` (both render a
     shared `ErrorPanel`) as a general safety net — *any* future unhandled
     throw in these route trees now shows a recoverable "Something went
     wrong / Try again" instead of a raw crash. This does **not** replace
     fixing individual actions to return errors gracefully (better UX,
     keeps the rest of the page usable) — it's a backstop for whatever
     hasn't been converted yet. `addCategoryAction`/`addItemAction`/etc.
     still throw on validation failure (e.g. a garbage price value) and
     rely on this backstop rather than an inline message; converting them
     to the same `useActionState` pattern as image upload is the natural
     next step if that turns out to matter in practice.

- **2026-08-04 — Rejected a shadcn CLI + HeroUI (`@heroui/react`) proposal
  for the admin UI; built an in-house `app/components/admin/ui/` kit
  instead.** The user's underlying complaint was fair — the panel was a
  pile of ad-hoc `<button>`s and div-grids with no consistent look — but
  the proposed fix would have: (1) required Tailwind, which is installed
  but deliberately unused everywhere else in this repo; (2) pulled in a
  full second design system (HeroUI, itself a NextUI-descended kit using
  React Aria) on top of shadcn's own Radix-based plumbing — two unrelated
  systems layered together, not "shadcn" in the usual sense; (3) pushed
  most of the admin UI to client-rendered (HeroUI's Table/Checkbox/Chip
  all need client state), reversing the Server-Component-first, minimal-JS
  posture this file already commits to for `/admin`. Instead: `Button`
  (variants `primary`/`secondary`/`ghost`/`danger`/`topbar`), `Badge`,
  `Card`, and a semantic `Table` family — all plain Server Components, zero
  new dependencies, styled via `.ui-*` classes against the site's existing
  tokens. Replaced *every* admin/portal button and the three ad-hoc
  layouts (`/admin` business list, `MenuEditor` category/item display,
  `/admin/qr-codes` card grid) with them; deleted the now-dead CSS those
  replaced (`.admin-list*`, `.admin-category*`, `.admin-item-list*`,
  `.admin-qr-grid/card/meta/status*`, `.admin-ghost-link`,
  `.admin-danger-link`, `.admin-primary-button`, `.admin-topbar-logout`).
  Verified in-browser as both staff and the business-owner portal login
  after the refactor — both render through the identical shared
  `MenuEditor`, so confirming one confirms the other.

- **2026-08-04 — Added item photos, reversing another original out-of-scope
  line ("menu item photos/image uploads").** Used R2 rather than storing
  images in D1 or inlining base64 — R2 is object storage, which is what
  it's for, and the project already anticipated it (`.openai/hosting.json`
  had an `"r2"` field sitting at `null` since the very first version of
  this file, and `vite.config.ts` already had `r2_buckets` binding logic
  ready to go, unused until now). Flipping `"r2": "MENU_IMAGES"` and
  restarting the dev server was the entire local-enablement step — mirrors
  the D1 enablement exactly. New pieces: `storage/r2.ts` (`getBucket()`,
  same lazy-import pattern as `db/index.ts`), `app/api/images/[...key]/route.ts`
  (public, unauthenticated — same trust level as the menu itself), and
  `app/admin/image-actions.ts` (upload/remove, authorized via the existing
  `requireBusinessAccess()` — no new authorization concept needed). Each
  upload gets a fresh timestamped key rather than overwriting one in place,
  so the serving route can cache aggressively and forever.
  **Verification gap, disclosed rather than papered over:** the browser
  automation tool used to test this project all session could not drive an
  actual `<input type="file">` (`form_input` errors on file inputs
  specifically, cleanly and consistently — not the general tool flakiness
  seen elsewhere this session). Verified instead: (1) the R2 binding itself
  — put/get round-trip — via a throwaway dev-only diagnostic route (created,
  used once, deleted); (2) `/api/images/[...key]` correctly serves back a
  real R2 object with the right headers, including the multi-segment-key
  case the catch-all route exists for; (3) `npm run build` and `vinext
  check` clean; (4) the admin/portal UI renders the new upload controls
  with no console errors, and the public menu page is unaffected when no
  image is present. **Not verified: an actual click-a-file, submit,
  see-the-thumbnail pass through the real UI.** If this surfaces a bug,
  start there — the untested surface is the `<form>` → `FormData` → `File`
  handoff in the browser itself, not the server-side logic.

- **2026-08-04 — Added client self-service (business portal), reversing the
  original "no client login" scope decision.** After using the panel, the
  user asked how a client business would actually edit its own menu — the
  answer at the time was "they can't, only Seagull staff can" — and decided
  that wasn't good enough. Implemented: `admins.role` ('staff' |
  'business_owner') + `admins.businessId`, reusing the *same* password/session
  machinery for both rather than building a parallel auth system. New
  boundaries in `auth/session.ts`: `requireAdmin()` (now staff-only, redirects
  a business_owner to `/portal` instead of looping them back through
  `/admin/login`), `requireBusinessOwner()`, `requireBusinessAccess(businessId)`
  (staff-or-matching-owner, used inside the category/item CRUD actions so
  `/admin/businesses/[id]` and the new `/portal` page share the exact same
  Server Actions and the same `MenuEditor` component — no duplicated CRUD
  logic). `logoutAction` is now role-aware (sends staff to `/admin/login`,
  business owners to `/portal/login`) since both top bars call the same action.
  A business owner can rename/relocate their business but not change its
  `slug` — the portal's edit form simply omits that field, and
  `updateBusinessAction` only touches `slug` when the submitted form
  actually included it. QR code management stayed staff-only; that wasn't
  reconsidered. Migration `0001_public_machine_man.sql` (two `ALTER TABLE
  ADD COLUMN`s) applied cleanly on top of existing data with no downtime.
- **`/api/dev/migrate` needed to become idempotent.** It originally
  re-ran every migration file every time and errored on `CREATE TABLE`
  once tables already existed — fine for a first run, useless once a second
  migration was added without wanting to wipe local test data. It now
  tracks applied files in a dev-only `_dev_migrations_applied` table and
  treats "already exists" errors as success (for files that predate that
  tracking table). If you add a new migration, hitting `/api/dev/migrate`
  again now only runs what's new.
- **The dev server occasionally needs a hard restart after adding new
  files**, not just saving existing ones — hit a spurious "Does the file
  exist?" import-resolution error for a brand-new component that
  definitely existed on disk; stopping and restarting the vinext dev server
  (not just waiting for HMR) resolved it immediately. If a fresh file
  4-levels-deep in relative imports won't resolve and the path looks
  correct, restart before assuming the code is wrong.
- **2026-08-04 — Built the full QR panel (schema, auth, admin CRUD, QR
  management, public menu pages) and found two real bugs during
  verification, both now fixed:**
  1. **`db/index.ts` had a top-level `import { env } from "cloudflare:workers"`.**
     Once a real route (not just the inert `examples/d1/`) actually used
     `getDb()`, this broke `npm run build`'s post-build check
     (`scripts/validate-artifact.sh`, which plain-Node-`import()`s the built
     worker — plain Node can't resolve the `cloudflare:` scheme at all).
     Fixed by making `getDb()` async and dynamically importing
     `cloudflare:workers` inside it, so loading the module no longer
     requires resolving that import — only calling `getDb()` does. Every
     `getDb()` call site across the app got `await`ed accordingly. Same fix
     applied to `app/api/dev/migrate/route.ts`.
  2. **`npm run start` cannot serve any D1-touching route — 500s on all of
     them, every time**, confirmed by testing after the build fix above:
     marketing pages returned 200, but `/admin/login`, `/menu/[slug]`, and
     `/q/[number]` all 500'd with the same `cloudflare:` scheme error,
     because `vinext start` runs in plain Node.js and does not emulate
     workerd/Miniflare. This *reverses* what this file said before —
     `npm run start` is not the more-trustworthy check for D1 code, `npm
     run dev` is (see Coding Rules, corrected).
  3. Also found (not a code bug, just confusing during manual testing): a
     public menu page renders **nothing** for a category whose items are
     all marked unavailable — no items *and* no "empty menu" message,
     because the per-category render bails out early when it has zero
     visible items, and the page-level empty-state check only fires when
     there are zero *categories*. Documented here rather than "fixed"
     because the underlying behavior (hide categories with nothing to show)
     is intentional; a future session touching `app/menu/[slug]/page.tsx`
     should be aware this is why a business can look like it has "no menu"
     when it actually has an empty/all-unavailable one.
- **2026-08-04 — Coding Rules hardened after a security-focused review pass.**
  Five corrections accepted as-is: `proxy.ts` instead of the deprecated
  `middleware.ts` name; every Server Action must independently call
  `requireAdmin()` (proxy-level gating alone doesn't protect Server Actions —
  they're directly callable endpoints); the "migrations auto-apply"
  claim was overstated (that's this platform's behavior, not D1's, and
  should be verified on the first real deploy, not assumed); QR `number`
  split from the `qr_codes.id` primary key (physical codes shouldn't be
  tied 1:1 to a DB auto-increment value); PBKDF2/session parameters made
  explicit (salt via `crypto.getRandomValues()`, iteration count + algo
  version stored alongside the hash, session token hashed in the DB rather
  than stored raw, explicit cookie attributes). Also added: tenant isolation
  rule (`WHERE id = ? AND business_id = ?` on every business-scoped query,
  even though only internal staff use the panel today), `is_active` on
  categories/items, `price_minor` integer + `currency` instead of a
  formatted price string, and `vinext check` / `npm run start` as
  additional verification steps beyond `npm run build`.
  **One suggestion adapted rather than adopted as-is:** CSS Modules for the
  admin panel — rejected in favor of an `.admin-` class-name namespace
  inside the existing single `globals.css`, because every other page in
  this repo already uses that one-global-stylesheet pattern and mixing in a
  second styling system for just one section would make the codebase
  inconsistent for no real gain. Same collision-avoidance goal, no new
  system. Also softened one suggested refactor (splitting `Header.tsx` into
  server/client sub-components) into a general principle rather than a hard
  rule, since the nav's active-link highlighting genuinely needs
  `usePathname()` client-side — there's no clean server-side equivalent for
  that in App Router layouts.
- **2026-08-04 — Chose Cloudflare D1 over external MySQL (confirmed after
  follow-up).** A free MySQL host (freesqldatabase.com, port 3306) was
  originally proposed; the user pushed back once, worried that D1→SQL
  migration would get harder as the project grows. Researched and
  confirmed: Cloudflare Hyperdrive *did* add MySQL support (April 2025,
  `mysql2` driver, needs `nodejs_compat` — already on in this repo), so raw
  MySQL is no longer flatly impossible on Workers in general. The blocker is
  more specific to this repo: Hyperdrive requires a `[[hyperdrive]]` binding
  declared in `wrangler.toml`/`wrangler.jsonc`, and this project has no such
  file — bindings only flow through `.openai/hosting.json`, which per
  `README.md` only documents `d1` and `r2`. Whether the Sites platform
  accepts a Hyperdrive binding is unverified and not worth gambling the
  whole feature on. Since the project already uses Drizzle, a later D1→MySQL
  migration (if the platform ever confirms Hyperdrive support) is a bounded,
  well-scoped schema-dialect change, not a rewrite — so "migration pain"
  isn't a strong reason to front-load the risk. **Decision: build on D1 now.
  Revisit MySQL/Hyperdrive only if someone confirms the Sites platform
  supports a Hyperdrive binding.** The MySQL credentials given are not used
  anywhere in this plan — don't add them to the repo. Also worth remembering
  independent of the Workers question: freesqldatabase.com is a free shared
  host with very low concurrent-connection limits (~4-5) — not something to
  lean on for a real client-facing panel even if connectivity were solved.
- **2026-08-04 — Scope: multi-tenant, not a single menu.** The panel manages
  multiple client businesses. `/qr-menu` stays as the marketing demo,
  untouched; the real product is `/admin/*` + `/menu/[slug]`.
- **2026-08-04 — Auth: username/password accounts**, not one shared admin
  password — multiple Seagull staff may need separate logins.
- **Local dev requires flipping `.openai/hosting.json`'s `"d1"` field from
  `null` to `"DB"`.** It was set to `null` earlier purely to get `npm run
  dev` running without any Cloudflare binding at all. With it `null`,
  `env.DB` will be `undefined` and every D1 call throws.
- **Node version:** this machine only had Node 20.18 installed system-wide
  (project needs 22.13+). A portable Node 22.23.1 was downloaded into
  `.tools/` and is used via `run-dev.cmd` to run `npm install` / `npm run
  dev`. If a dev command fails with a Node-version error, use that portable
  Node, not system Node.
- **This is an OpenAI "Sites"-platform project, not a self-hosted Cloudflare
  Workers app** — there's no `wrangler.jsonc`; deployment and D1
  provisioning are handled by that platform's own build pipeline
  (`.openai/hosting.json` declares binding names; the platform wires the
  real values on deploy). Don't run manual `wrangler deploy` / `wrangler d1`
  commands expecting them to do anything here.
