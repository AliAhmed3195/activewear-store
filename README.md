# Peak Activewear — Sportswear E-commerce

Professional activewear / gym wear store with customer website and admin portal.

## Features

### Customer Website
- Homepage with new arrivals, categories, reviews, trust badges
- Shop with filters (category, gender, size, sort)
- Product pages with **color variants** + size stock
- Guest wishlist (localStorage)
- Cart + checkout with **PKR / USD** based on country
- Payments: **COD**, **Stripe Card**, JazzCash & EasyPaisa (UI ready, wallets Phase 1.5)
- Order tracking

### Admin Portal (`/admin`)
- Dashboard, Products (with variants), Inventory, Categories
- Orders, Customers, Reviews, Settings
- Auth.js credential login

## Stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS 4
- PostgreSQL + Prisma 6
- Stripe · Auth.js v5

## Database

**Use a separate PostgreSQL database** — do not share the Elvene Noir database URL.

```bash
cp .env.example .env.local
# Set DATABASE_URL to a new database (e.g. activewear_store)
npm run db:push -- --accept-data-loss
npm run db:seed
```

The `--accept-data-loss` flag is required on first push because this schema replaces the old product structure with variants.

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin

Default admin (from seed):
- Email: `admin@example.com`
- Password: `ChangeMe2026!`

## Branding

Configure via `.env.local`:

```
NEXT_PUBLIC_STORE_NAME="Your Brand"
NEXT_PUBLIC_STORE_TAGLINE="Gear Up. Move Better."
NEXT_PUBLIC_STORE_URL="https://yourdomain.com"
```

## Currency

- Pakistan (`PK`): PKR, COD + wallets + card
- International: USD, Stripe card only

Adjust rates and shipping in `.env.example`.

## Production deployment

- Set `AUTH_SECRET`, `AUTH_URL`, and `NEXT_PUBLIC_STORE_URL` to your live domain.
- **Uploads** (`public/uploads/products`, `public/uploads/brand`) are stored on the server filesystem. Use a VPS, Docker volume, or sync uploads to object storage (S3/R2) — serverless hosts without persistent disk will lose uploaded images on redeploy.
- Run `npm run build` && `npm start` (or your process manager). Ensure PostgreSQL is reachable and run `npm run db:push` once on the production database before seeding.

## Project structure

```
activewear-store/     ← This project (separate from elvene-noir-nocturne)
elvene-noir-nocturne/ ← Original lingerie store (unchanged)
```
