# LVY — Product Requirements Document

| | |
|---|---|
| **Product** | LVY — Premium Furniture E-Commerce Platform |
| **Document type** | Product Requirements Document (PRD) |
| **Version** | 1.0 |
| **Last updated** | 2026-06-17 |
| **Status** | Living document |
| **Source of truth for build spec** | `PROMPT.md` (original brief), this PRD (current + planned) |

> **Status legend used throughout this document**
> - ✅ **Built** — implemented and working in the current codebase
> - 🟡 **Partial** — partially implemented; gaps noted
> - ⛔ **Planned** — specified but not yet implemented

---

## 1. Executive Summary

LVY is a full-stack e-commerce platform for a high-end home-furniture brand. The product goal is twofold:

1. **A polished, editorial storefront** that feels like a premium ThemeForest/Framer template — warm neutral palette, oversized photography, serif/sans type pairing, motion-rich but fast.
2. **A real, functional commerce backend** — authentication, catalog management, cart, multi-step checkout with Stripe, delivery tiers, order lifecycle, reviews, and a complete admin console for store operations.

The platform is a monorepo: a React + Vite client and an Express + Prisma + PostgreSQL server, designed to be containerized with Docker and deployed to Vercel (frontend) + a Node host (backend) + managed Postgres.

---

## 2. Goals & Non-Goals

### 2.1 Goals
- Let a customer discover products, build a cart, and complete a purchase (guest or registered) with Stripe.
- Give store operators a single admin console to manage the entire catalog, orders, customers, and store configuration.
- Maintain a "template-grade" visual bar: responsive 320px → 4K, smooth animations, consistent design tokens.
- Keep content (home page sections, store settings) editable without code changes.
- Ship with zero TypeScript errors and a clean, conventional codebase.

### 2.2 Non-Goals (for v1)
- Marketplace / multi-vendor support.
- Subscriptions or recurring billing.
- In-house fulfillment/warehouse management beyond order status tracking.
- Native mobile apps.
- Advanced merchandising (A/B tests, personalization engines).

---

## 3. Target Users & Personas

| Persona | Description | Primary needs |
|---|---|---|
| **Shopper (guest)** | Browses, may buy without an account | Fast browsing, clear pricing/delivery, frictionless guest checkout |
| **Registered customer** | Returning buyer | Order history, tracking, saved addresses, reviews, wishlist |
| **Store admin** | Operations/merchandising staff | Manage catalog, fulfill orders, moderate reviews, configure store |
| **Owner / super-admin** | Business owner | Dashboard KPIs, user/role management, store settings |

---

## 4. Information Architecture / Site Map

### 4.1 Storefront (public)
- `/` — Home ✅
- `/shop`, `/shop/:category` — Catalog ✅
- `/product/:slug` — Product detail ✅
- `/cart` — Cart ✅
- `/checkout` — Multi-step checkout ✅
- `/order/:number` — Order confirmation + tracking ✅
- `/about` ✅, `/shipping` ✅
- `/login`, `/register` ✅
- `/account` — Customer account ✅
- Collections/Lookbook, Sustainability, Showrooms, Blog, Contact, FAQ ⛔

### 4.2 Admin (`/admin`, role-gated)
Overview ✅ · Orders ✅ · Products ✅ · Categories ✅ · Collections ✅ · Customers ✅ · Users ✅ · Reviews ✅ · Coupons ✅ · Shipping Zones ✅ · Content ✅ · Settings ✅

---

## 5. Feature Requirements

### EPIC A — Authentication & Accounts

**A1. Registration & Login** ✅
- Email + password registration with bcrypt-hashed credentials.
- JWT auth with **access + refresh** tokens; access token attached via Axios interceptor; persisted in `localStorage` (`lvy.token`) and Zustand (`lvy.auth`).
- `GET /auth/me` returns the current user.
- **Acceptance:** Invalid credentials return 401; valid login returns `{ user, accessToken, refreshToken }`; protected routes reject missing/invalid tokens.

**A2. Roles & Access Control** ✅
- `Role` enum: `CUSTOMER` | `ADMIN`.
- `requireAuth` + `requireAdmin` middleware; `/admin/*` API protected server-side; `/admin` UI redirects non-admins.
- **Acceptance:** Non-admin hitting an admin API gets 403; unauthenticated gets 401; non-admin visiting `/admin` is redirected home.

**A3. Customer Account Area** ✅
- Order history, profile. Addresses stored on `Address` model.
- **Gaps / Planned:** Google OAuth ⛔; password reset flow ⛔.

---

### EPIC B — Product Catalog

**B1. Catalog Listing** ✅
- `GET /products` with search (`q`), `category`, `minPrice`/`maxPrice`, `sort` (`new` | `price_asc` | `price_desc` | `rating`), pagination (`page`, `limit` max 48), `featured` filter.
- **Acceptance:** Returns `{ items, total, page, pages }`; filters compose; sort works.

**B2. Product Detail** ✅
- `GET /products/:slug` returns product + category + variants + approved reviews + related products (same category).
- Storefront: gallery, variant selector, stock indicator, add-to-bag, related products, reviews.
- **Gaps:** 3D model viewer (`model3dUrl` field exists, `Product3D` component present) — verify wiring 🟡; delivery estimate by ZIP on PDP 🟡 (quote endpoint exists, PDP integration to confirm).

**B3. Categories** ✅
- `GET /categories` with product counts.

**B4. Collections / Lookbook** 🟡
- Data model + **admin CRUD built** ✅. **Storefront collections page and public `/collections` API are not yet built** ⛔. Products↔Collections is many-to-many (`ProductCollections`); admin product assignment to collections is a future enhancement.

---

### EPIC C — Cart & Checkout

**C1. Cart** ✅
- Server cart for logged-in users (`GET/POST/DELETE /cart`), unique on `(userId, productId, variant)`; client Zustand store for cart state.

**C2. Checkout** ✅
- Multi-step: Cart → Shipping → Delivery tier → Payment → Review → Confirmation.
- **Guest checkout** supported (`optionalAuth` on order create); promo code application; tax + shipping calculation.
- `POST /orders` creates the order; `POST /orders/claim` lets a newly-registered user claim guest orders by email.

**C3. Payments** ✅ (Stripe) / ⛔ (PayPal)
- `POST /payments/intent` creates a Stripe PaymentIntent; `POST /payments/webhook` consumes Stripe events (raw body mounted before JSON parser).
- **PayPal** secondary provider ⛔.

**C4. Coupons** ✅
- `Coupon` model (`percent` | `fixed`, `minTotal`, `expiresAt`, `active`, `usedCount`). Admin CRUD + active toggle. Applied at checkout.

---

### EPIC D — Orders & Delivery

**D1. Order Lifecycle** ✅
- `OrderStatus`: `PENDING → CONFIRMED → PACKED → SHIPPED → OUT_FOR_DELIVERY → DELIVERED`, plus `CANCELLED`, `REFUNDED`.
- `PaymentStatus`: `PENDING | PAID | FAILED | REFUNDED`.
- Admin can update status and payment status; refund action sets both to `REFUNDED` (Stripe refund call stubbed for production).

**D2. Delivery Tiers & Tracking** 🟡
- `DeliveryTier`: `STANDARD | EXPRESS | WHITE_GLOVE`. `Shipment` model holds carrier, tracking code, timestamps, and a JSON `events` timeline.
- Order confirmation page renders a delivery timeline ✅.
- **Gaps:** Delivery slot booking for large items ⛔; carrier integration ⛔.

**D3. Shipping Rates** 🟡
- `POST /shipping/quote` currently returns **hardcoded** rate logic by postal prefix.
- `ShippingZone` model + **admin CRUD built** ✅ (name, postalPrefix, standard/express/whiteGlove rates).
- **Gap:** The public quote endpoint does **not yet read from `ShippingZone`** — wiring the quote to zone data is the next step to make zones functional end-to-end.

---

### EPIC E — Reviews & Ratings

**E1. Customer Reviews** ✅
- `POST /reviews` (auth) to submit; `GET /reviews/mine`. Reviews require approval before appearing on PDP.
- Product `rating` is recomputed from approved reviews.

**E2. Review Moderation** ✅
- Admin: list by status (pending/approved/all), approve, **reject/unpublish**, delete, and **bulk-approve**. Rating recompute on every state change.

---

### EPIC F — Content / CMS

**F1. Editable Home Page** ✅
- `Page` + `Section` models; section types: `hero | story | featured | categoryGrid | scrollScene | stats | cta`. `GET /content/:slug` for storefront; admin can edit section data/enabled/order and reset home to defaults.

**F2. Store Settings** ✅
- `Setting` key-value (JSON) store with defaults (store name, support email, currency, tax rate, shipping thresholds/rates, socials). Admin get-all + bulk upsert + single-key upsert.

---

### EPIC G — Admin Dashboard (`/admin`)

A persistent sidebar console. All sections include a data table/grid, add/edit modal or drawer, delete confirmation, loading states, and **toast notifications** for success/error.

| Section | Capabilities | Status |
|---|---|---|
| **Overview** | KPI cards (revenue/orders/customers/products), revenue area chart, orders-by-status pie, top products bar, low-stock alerts, date-range toggle | ✅ |
| **Orders** | Paginated table, search, status filter, status + **payment-status** controls, order drawer (items, address, notes, refund), CSV export | ✅ |
| **Products** | List, search, create/edit (images w/ drag reorder via MediaPicker), delete, **featured/new quick toggles**, variants drawer (CRUD) | ✅ |
| **Categories** | Grid, create/edit/delete | ✅ |
| **Collections** | Grid, create/edit/delete | ✅ |
| **Customers** | Paginated list, search, drawer (orders, addresses, lifetime value) | ✅ |
| **Users** | All roles, search + role filter, **role badge**, **change role** (last-admin demotion guard, self-protection) | ✅ |
| **Reviews** | Pending/approved tabs, approve, unpublish, delete, bulk-approve | ✅ |
| **Coupons** | Table, create/edit/delete, **active toggle** | ✅ |
| **Shipping Zones** | Table, create/edit/delete (rates per tier) | ✅ |
| **Content** | Home page sections editor | ✅ |
| **Settings** | Grouped key-value controls | ✅ |
| **Dashboard API** | `GET /admin/dashboard` → totals + recent orders + low stock | ✅ |

**Acceptance (admin global):** Every CRUD action persists, invalidates the relevant query, and surfaces a toast; destructive actions confirm first; all endpoints require `role === "ADMIN"`.

---

## 6. Data Model (Prisma / PostgreSQL)

Core entities and key relationships:

- **User** (id, email⊙, passwordHash, name, role, phone) → Address[], Order[], Review[], WishlistItem[], CartItem[]
- **Address** (belongs to User; used by Order)
- **Category** (name⊙, slug⊙) → Product[]
- **Collection** (slug⊙) ⇄ Product[] (`ProductCollections` m-n)
- **Product** (slug⊙, price `Decimal(10,2)`, compareAt, images[], stock, featured, isNew, rating, model3dUrl, categoryId) → ProductVariant[], Review[], OrderItem[]
- **ProductVariant** (sku⊙, color/size, price, stock)
- **CartItem** (unique `userId+productId+variant`)
- **WishlistItem** (unique `userId+productId`)
- **Order** (number⊙, email, subtotal/shipping/tax/discount/total `Decimal`, currency, deliveryTier, status, paymentStatus, stripeId, couponCode, notes) → OrderItem[], Shipment?
- **OrderItem** (snapshot of name/image/price/qty/variant)
- **Shipment** (1-1 with Order; carrier, trackingCode, timestamps, JSON events)
- **Review** (rating, title?, body, approved)
- **Coupon** (code⊙, type, value, minTotal, expiresAt, active, usedCount)
- **Page** → **Section** (type, order, enabled, JSON data)
- **Setting** (key PK, JSON value)
- **ShippingZone** (name, postalPrefix, standard/express/whiteGlove `Decimal`)

⊙ = unique. Enums: `Role`, `OrderStatus`, `PaymentStatus`, `DeliveryTier`.

---

## 7. API Specification (`/api/v1`)

### Public / customer
```
POST   /auth/register | /auth/login | /auth/refresh
GET    /auth/me                              (auth)
GET    /products?q&category&minPrice&maxPrice&sort&page&limit&featured
GET    /products/:slug
GET    /categories
GET    /cart  ·  POST /cart  ·  DELETE /cart/:id      (auth)
POST   /orders                               (optional auth — guest ok)
GET    /orders/mine                           (auth)
POST   /orders/claim                          (auth)
GET    /orders/:number
POST   /payments/intent
POST   /payments/webhook                      (Stripe, raw body)
POST   /shipping/quote
POST   /reviews  ·  GET /reviews/mine         (auth)
GET    /content/:slug
```

### Admin (`/admin/*`, requireAuth + requireAdmin)
```
GET    /admin/stats · /admin/stats/timeseries · /admin/dashboard
GET    /admin/products · POST /admin/products · PUT/DELETE /admin/products/:id
PATCH  /admin/products/:id/featured · /admin/products/:id/new
GET    /admin/variants · POST · PUT/DELETE /admin/variants/:id
GET    /admin/categories · POST · PUT/DELETE /admin/categories/:id
GET    /admin/collections · POST · PUT/DELETE /admin/collections/:id
GET    /admin/orders · /admin/orders-paged · /admin/orders/:id · /admin/orders.csv
PATCH  /admin/orders/:id/status · /:id/payment · /:id/notes
POST   /admin/orders/:id/refund
GET    /admin/users · /admin/users/:id · PATCH /admin/users/:id/role
GET    /admin/customers · /admin/customers/:id
GET    /admin/coupons · POST · PUT/DELETE /admin/coupons/:id · PATCH /:id/toggle
GET    /admin/reviews · PATCH /:id/approve · /:id/reject · DELETE /:id · POST /reviews/bulk-approve
GET    /admin/shipping-zones · POST · PUT/DELETE /admin/shipping-zones/:id
GET    /admin/settings · PUT /admin/settings · PUT /admin/settings/:key
GET    /admin/content/pages · /pages/:slug · PUT /sections/:id · POST /pages/:slug/reset
GET    /admin/media
```

**Conventions:** list endpoints return `{ items, total, page, pages }`; errors via central handler — Zod → 422 `{ error, issues }`, `HttpError` → status `{ error }`, otherwise 500.

**Planned:** `/wishlist`, `/upload` (Cloudinary), `/collections` (public), PayPal payment routes, OpenAPI docs.

---

## 8. Non-Functional Requirements

| Area | Requirement | Status |
|---|---|---|
| **Performance** | Lighthouse ≥ 95; lazy images; code splitting; 60fps animations | 🟡 target |
| **Responsive** | 320px → 4K, mobile-first | ✅ (storefront); admin desktop-first 🟡 |
| **Accessibility** | WCAG AA, keyboard nav, ARIA, focus rings | 🟡 target |
| **Security** | helmet, CORS allowlist, rate limiting (200/min), bcrypt, JWT, server-side role checks, Zod validation | ✅ |
| **Dark mode** | Toggle + persisted preference | ⛔ |
| **i18n / RTL** | Arabic + RTL | ⛔ |
| **Observability** | morgan request logging | ✅ basic |
| **Caching** | Redis session/cart cache | ⛔ |
| **Code quality** | Zero TS errors, ESLint clean | 🟡 (2 pre-existing `jwt.ts` type warnings; runtime-fine under tsx) |

---

## 9. Technical Architecture

```
lvy/
├── client/   React 18 · Vite · TS · Tailwind · Framer Motion · React Router v6
│             TanStack Query (server state) · Zustand (auth/cart/wishlist/toast)
│             Recharts (admin charts) · @react-three/fiber (3D) · Stripe.js
├── server/   Express · TS · Prisma v5 · PostgreSQL · JWT · bcrypt · Stripe · Zod
│             middleware: auth (requireAuth/requireAdmin/optionalAuth), error
│             single Prisma client (lib/prisma.ts)
└── docker-compose.yml   postgres (+ redis planned)
```

**Design tokens** (`tailwind.config.ts`, single source of truth):
- Colors: cream `#F6F1EA`, sand `#EADFCE`, charcoal `#1C1B19`, walnut `#5B3A21`, stone/muted `#8B847C`, **terracotta `#83382E`** (primary), **sage `#708058`** (secondary/success).
- Fonts: display `Instrument Serif`, sans `Instrument Sans`; tightest tracking `-0.04em`.
- Sections under `components/sections/` are prop-driven and swappable; `components/ui/` is presentational.

---

## 10. Success Metrics / KPIs

- **Conversion rate** (sessions → completed orders).
- **Checkout completion rate** (cart → confirmation) and step drop-off.
- **AOV** (average order value) and revenue (paid orders).
- **Catalog health:** % low-stock SKUs, time-to-publish for new products.
- **Ops efficiency:** median time PENDING → SHIPPED; review moderation backlog.
- **Quality:** Lighthouse Perf/A11y/SEO ≥ 95; zero TS errors.

---

## 11. Acceptance Criteria (v1 release)

- [ ] Full purchase flow works in Stripe test mode (guest + registered).
- [x] Admin can add a product → appears on storefront.
- [x] Order placed → status flow drives confirmation/tracking page.
- [x] Admin console covers all entities with CRUD + toasts + role protection.
- [ ] Email on order confirmation + shipping updates.
- [ ] Lighthouse Perf/A11y/SEO ≥ 95.
- [ ] Fully responsive + dark mode + 60fps.

---

## 12. Roadmap / Milestones

**Now (shipped):** Auth, catalog, cart, Stripe checkout, orders + status, reviews + moderation, content/home CMS, **full admin console** (incl. Collections, Users, Shipping Zones, payment-status, toasts).

**Next (M1 — make existing features whole):**
1. Wire `POST /shipping/quote` to `ShippingZone` data (close the zones loop).
2. Public Collections page + `/collections` API + admin product↔collection assignment.
3. Wishlist UI (store exists) + `/wishlist` API.
4. Customer review submission UX polish on PDP.

**M2 — commerce depth:** Email notifications (Nodemailer); Cloudinary uploads in admin; PayPal; password reset; Google OAuth.

**M3 — template polish:** Dark mode toggle; Lighthouse ≥ 95 pass; a11y audit (WCAG AA); delivery slot booking.

**M4 — scale & DX:** Redis caching; OpenAPI docs + Postman; i18n + RTL Arabic; 50+ product seed.

---

## 13. Risks & Open Questions

- **Shipping zones vs. settings overlap:** rates exist both in `Setting` (flat) and `ShippingZone` (per-prefix). Need a single canonical source the quote endpoint reads. *(Open decision.)*
- **Customers vs. Users admin pages:** two overlapping views — keep both (different lenses) or consolidate? *(Open decision.)*
- **Refunds are stubbed:** admin refund flips status but does not call Stripe yet — must integrate before handling real money.
- **Token storage in `localStorage`:** acceptable for v1; consider httpOnly cookies if XSS surface grows.
- **Decimal handling:** Prisma `Decimal` serializes to string in JSON; client coerces with `Number(...)` — keep consistent in new code.

---

## 14. Appendix — Demo Accounts & Local Setup

| Role | Email | Password |
|---|---|---|
| Admin | `admin@lvy.shop` | `admin1234` |
| Customer | `demo@lvy.shop` | `demo1234` |

Coupon: `WELCOME10`. Backend `:4000`, frontend `:5173`. See `README.md` for Docker / local run steps and Stripe webhook forwarding.
