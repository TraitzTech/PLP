# Property Listing Portal (PLP)

A modern, production-ready property listing platform built with Next.js App Router, TypeScript, Tailwind CSS, and a rich set of UI components. It supports static export (output: export), server/client component separation, admin dashboards, agent dashboards, search, pricing, privacy pages, and dynamic routes pre-rendered via generateStaticParams.

Repo: https://github.com/TraitzTech/PLP

## Tech Stack

- Next.js 13.5 (App Router, SSG, output: export)
- TypeScript 5.2
- React 18
- Tailwind CSS 3
- Radix UI + shadcn/ui components
- Lucide React icons
- Zod, React Hook Form (via resolvers)
- Recharts (charts), Embla (carousel)
- next-themes, next-intl (theming/i18n)
- Supabase JS (optional future integration)
- Date-fns, clsx, tailwind-merge
- Sonner (toasts)

## Project Highlights

- App Router-first structure under app/
- Static export-friendly setup (next.config.js: output: 'export')
- Dynamic routes pre-generated using generateStaticParams
- Clear server vs client split for pages with interactive logic
- Admin area: properties, users
- Agent dashboard: clients, properties, bookings, settings
- Public pages: home, search, property details, pricing, privacy, etc.
- Reusable UI components and dashboard layout

## Monorepo Structure (key folders)

- app/ — routes (server by default)
    - admin/ — admin dashboards and tools
    - dashboard/agent — agent tools (clients, properties, etc.)
    - property/[id] — property details (server page + client wrapper)
    - privacy, pricing, search, etc.
- components/
    - navigation, properties, reviews, ui
    - admin/ — client-side admin editors
    - dashboard/agent — client-side agent editors
- styles: app/globals.css, Tailwind setup
- config: next.config.js, tailwind.config.ts, tsconfig.json

## Getting Started

1) Prerequisites
- Node.js 18+
- npm (project uses npm lockfile)

2) Clone and install
```shell script
git clone https://github.com/TraitzTech/PLP.git
cd PLP
npm install
```


3) Run dev server
```shell script
npm run dev
```

- App: http://localhost:3000

4) Build (static export)
```shell script
npm run build
npm run export    # optional if you add a custom export script, otherwise Next creates out/ with output: 'export'
```

- The build is configured to:
    - Skip ESLint during build
    - Ignore TypeScript build errors (temporary safety net)
    - Produce static output compatible with static hosting (images unoptimized)

Note: For dynamic routes, ensure generateStaticParams is implemented where needed.

## Environment Variables

Currently the app uses mock data. For future integrations (e.g., Supabase), create .env.local and add required keys. Example:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# SUPABASE_URL=...
# SUPABASE_ANON_KEY=...
```


## Server vs Client Components

- Server Components by default in app/
- Any component that uses hooks (useState/useEffect), browser APIs (window/localStorage), or event listeners must be a Client Component with "use client" at the top.
- Preferred pattern:
    - Keep pages as Server Components (especially dynamic routes needing generateStaticParams)
    - Move interactive logic into Client Components under components/

Examples already implemented:
- Property details page (server) + PropertyDetailsWrapper (client)
- Admin/Agent edit pages (server with generateStaticParams) + client editors in components/

## Common Tasks

- Add a new dynamic route that must be exported:
    - Implement export async function generateStaticParams() in the server page
    - Move any interactive logic to a "use client" component and render it from the page
- Silence implicit any on map callbacks quickly:
    - property.images.map((img: string, index) => ...)
    - Or configure lint/TS as needed (already ignoring build errors by default)

## Scripts

- npm run dev — start dev server
- npm run build — build for production (static export ready)
- npm run start — serve production build (when applicable)
- npm run lint — run ESLint

## UI/Design System

- Tailwind CSS + tailwind-merge + clsx
- shadcn/ui primitives under components/ui
- Radix UI under the hood for accessibility
- Lucide icons for clean iconography
- Theming via next-themes

## Internationalization and Theming

- next-themes for light/dark/system theme
- next-intl planned; current language switching saved to localStorage and read by client wrappers where needed

## Static Export Notes

- output: 'export' requires all dynamic routes to be statically determined
- Ensure pages like app/.../[id]/page.tsx define generateStaticParams and avoid client-only APIs directly in server files
- Images are unoptimized (images: { unoptimized: true }) to support static hosting

## Folder Examples

- app/property/[id]/page.tsx — server page with generateStaticParams, renders PropertyDetailsWrapper (client)
- components/properties/property-details-client.tsx — interactive component with hooks
- components/...-edit-client.tsx — client editors for admin/agent flows
- app/admin/.../[id]/edit/page.tsx — server-only wrapper + static params + fetch mock

## Code Style

- TypeScript strictness can be tightened by removing ignoreBuildErrors when the codebase is ready
- Prefer typing props and callback params to avoid implicit any
- Keep client-only code behind "use client" boundaries

## Deployment

Because the project builds to a static output:
- Any static host works (e.g., Netlify, Vercel static, GitHub Pages, S3 + CDN)
- Upload the out/ directory content (or configure your host to build from repo)
- Ensure all dynamic routes you need are included in generateStaticParams

## Contributing

- Create a feature branch off main
- Follow the server/client component separation pattern
- Add generateStaticParams to any new dynamic route under output: export
- Keep UI consistent with Tailwind utility classes and existing design tokens
- Open a PR with a concise description and testing steps

## Roadmap Ideas

- Replace mocks with real APIs (e.g., Supabase)
- Authentication/authorization for admin/agent/customer roles
- Real search, filters, and map integration
- Payments integration for subscriptions
- Fully typed domain models shared across client/server

## License

Proprietary — TraitzTech. All rights reserved.

## Contact

- Org: TraitzTech
- Repo: https://github.com/TraitzTech/PLP

If you need help setting up or extending, reach out to the team on your internal channels.