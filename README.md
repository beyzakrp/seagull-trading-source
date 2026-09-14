# Seagull Trading — Frontend only

The site contains Home, Services, Work, QR Menu (marketing/demo), and About pages. Existing design, animations and contact form are preserved. The contact form opens the visitor's email application.

Admin and business portals, login, QR generation, dynamic customer menus, APIs, database and image uploads have been removed. No Cloudflare runtime or database is required.

## Development

Use Node.js 22.13 or newer. Install with `npm ci`, then run `npm run dev`.

## Build and preview

Run `npm run build` to generate the static `out/` directory. Run `npm start` to preview it at http://127.0.0.1:3000. Run `node --test tests/rendered-html.test.mjs` to verify all five exported pages and absence of backend routes.

## Plesk upload

Upload the contents of `out/` into the domain's `httpdocs` directory, including `_next` and every page directory. The root should contain `index.html`. Node.js is needed only to build locally, not on the hosting server. Configure index.html as the default document. Do not upload source files or node_modules.

Changes in this checkout do not automatically update a deployed site or delete previously hosted data.
