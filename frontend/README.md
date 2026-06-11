# ZenithCart — Frontend

Next.js 14 (App Router) + TypeScript storefront and vendor dashboard for the
ZenithCart platform.

## Stack

- **Next.js 14 (App Router)** — SSG landing page, SSR product detail pages
- **TypeScript** (strict)
- **Tailwind CSS + Shadcn UI** primitives, light/dark mode via `next-themes`
- **TanStack Query (React Query)** — server-state with stale-while-revalidate
- **Zustand** — persistent (LocalStorage) shopping cart + auth session state
- **Axios** — global instance with request/response interceptors that silently
  refresh expired JWT access tokens
- **React Hook Form + Zod** — typed, validated forms (login, register, checkout)

## Getting started

```bash
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at the DRF API
npm install
npm run dev                  # http://localhost:3000
```

The API base URL (including the `/api/v1` prefix) is configured via
`NEXT_PUBLIC_API_URL`.

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server                 |
| `npm run build` | Production build                     |
| `npm run start` | Serve the production build           |
| `npm run lint`  | ESLint                               |

## Structure

```
src/
├── app/
│   ├── (storefront)/        # public store: landing, products, cart, checkout
│   ├── (auth)/              # login / register
│   └── dashboard/           # vendor dashboard (guarded)
├── components/
│   ├── ui/                  # Shadcn primitives
│   ├── storefront/          # navbar, cart drawer, product card, …
│   └── dashboard/           # sidebar, stat cards, guard
├── hooks/                   # React Query hooks
├── lib/
│   ├── api/                 # axios instance + endpoints
│   └── auth/                # token store
├── providers/               # QueryProvider, ThemeProvider
├── store/                   # Zustand stores (cart, auth)
└── types/                   # shared API types
```
