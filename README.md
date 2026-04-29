# LVY — Premium Furniture E-Commerce

Full-stack monorepo for a high-end furniture shop. Built to feel like a premium ThemeForest/Framer template, with real auth, payments, and delivery management.

```
lvy/
├── client/      React 18 + Vite + Tailwind + Framer Motion
├── server/      Node + Express + Prisma + PostgreSQL + Stripe
├── docker-compose.yml
└── PROMPT.md    Original build spec
```

## Quick Start

### Option A — Docker (recommended)
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
docker compose up --build
```
Then open <http://localhost:5173>. API at <http://localhost:4000>.

### Option B — Local
```bash
# 1. Start postgres + redis
docker compose up -d postgres redis

# 2. Install
npm install
npm --workspace server install
npm --workspace client install

# 3. Configure envs
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Migrate + seed DB
npm --workspace server run db:migrate -- --name init
npm --workspace server run db:seed

# 5. Run dev
npm run dev
```

## Demo Accounts (after seed)
| Role     | Email             | Password    |
|----------|-------------------|-------------|
| Admin    | admin@lvy.shop    | admin1234   |
| Customer | demo@lvy.shop     | demo1234    |

Coupon code: `WELCOME10` (10% off)

## Tech Stack
**Frontend:** React 18, Vite, TypeScript, TailwindCSS, Framer Motion, React Router, TanStack Query, Zustand, Stripe.js
**Backend:** Express, TypeScript, Prisma, PostgreSQL, Redis, JWT, Stripe, Zod
**DevOps:** Docker, docker-compose

## Pages
- `/` Home — hero, featured products, category grid, story
- `/shop` · `/shop/:category` — catalog with sort
- `/product/:slug` — gallery, variants, add to bag, related
- `/cart` — bag with qty controls
- `/checkout` — multi-step (shipping → delivery tier → payment)
- `/order/:number` — confirmation + delivery timeline
- `/account` — orders, profile
- `/admin` — stats, orders, status updates
- `/login` · `/register` · `/about`

## API Routes
```
POST  /api/v1/auth/{register,login,refresh}
GET   /api/v1/auth/me
GET   /api/v1/products?category=&sort=&page=&limit=
GET   /api/v1/products/:slug
GET   /api/v1/categories
GET/POST/DELETE /api/v1/cart
POST  /api/v1/orders
GET   /api/v1/orders/mine | /:number
POST  /api/v1/payments/intent
POST  /api/v1/payments/webhook       (Stripe)
POST  /api/v1/shipping/quote
GET   /api/v1/admin/stats | orders
POST  /api/v1/admin/products
PATCH /api/v1/admin/orders/:id/status
```

## Template-Friendly Architecture
Every section under `client/src/components/sections/` is self-contained and prop-driven, making it trivial to swap visuals with Framer / ThemeForest templates without touching business logic. Tailwind theme tokens live in `tailwind.config.ts` — change colors and fonts in one place to fully re-skin the brand.

## Stripe Setup
1. Create a [Stripe](https://dashboard.stripe.com) test account
2. Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `server/.env`
3. Add `VITE_STRIPE_PUBLISHABLE_KEY` to `client/.env`
4. Forward webhooks locally: `stripe listen --forward-to localhost:4000/api/v1/payments/webhook`

## Production
- **Frontend:** Vercel (`npm --workspace client run build`)
- **Backend:** Railway / Render / Fly.io (Dockerfile included)
- **DB:** Neon, Supabase, or managed Postgres

## Roadmap
- [ ] PayPal checkout
- [ ] Cloudinary uploads in admin
- [ ] Wishlist UI
- [ ] Reviews submission
- [ ] Email notifications (Nodemailer)
- [ ] i18n + RTL Arabic
# LVY
