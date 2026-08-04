# Seagull Trading Website — Quick Start

## Requirements

- Node.js 22.13 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Then open the local address shown in the terminal.

## Where to edit

- `app/page.tsx`: page content, portfolio projects, services, QR menu demo and interactions
- `app/globals.css`: complete visual design, colors, typography and responsive layout
- `app/layout.tsx`: page title, description and metadata
- `public/`: logos and hero image

## Build for production

```bash
npm run build
```

The package intentionally excludes `node_modules`, build output, Git history,
temporary runtime files and the original hosted-site project binding.

Before publishing, replace the sample email address `hello@seagulltrade.me`
and placeholder social links with the real Seagull Trading contact details.
