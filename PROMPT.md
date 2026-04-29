# Prompt: Build a Premium Furniture E-Commerce Platform ("LVY")

## Project Overview
Build a full-stack, production-ready e-commerce web application for a high-end home furniture shop. The platform must look and feel like a premium ThemeForest/Framer template — pixel-perfect, smooth, and visually rich — while being fully functional with real backend logic, payments, and delivery management.

---

## Tech Stack

**Frontend**
- React 18 + Vite + TypeScript
- TailwindCSS + shadcn/ui components
- Framer Motion (page transitions, scroll reveals, hover micro-interactions)
- React Router v6
- Zustand (cart/auth state) + React Query (server state)
- React Hook Form + Zod validation
- Swiper.js for hero/product carousels
- Lenis for smooth scrolling

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT auth (access + refresh tokens) + bcrypt
- Stripe (primary) + PayPal (secondary) for online payments
- Cloudinary for product image hosting
- Nodemailer (order confirmations, shipping updates)
- Redis for session/cart caching
- Zod for request validation

**DevOps**
- Docker + docker-compose
- ESLint + Prettier + Husky
- Vercel (frontend) + Railway/Render (backend)

---

## Design Requirements (Template-Grade Quality)

- **Aesthetic:** Minimal, editorial, warm neutrals (cream, terracotta, walnut, charcoal). Large typography, generous whitespace, oversized product photography.
- **Typography:** Pair a serif display font (Fraunces/Cormorant) with a clean sans (Inter/General Sans).
- **Animations:** Scroll-triggered reveals, parallax hero, magnetic cursor on CTAs, image zoom on hover, smooth route transitions.
- **Responsive:** Mobile-first, perfect on all breakpoints (320px → 4K).
- **Dark mode** toggle with persisted preference.
- **Accessibility:** WCAG AA, keyboard navigation, ARIA labels, focus rings.
- **Performance:** Lighthouse 95+, lazy-loaded images, code splitting.

---

## Pages & Features

### Public
1. **Home** — Hero with parallax, featured collections, new arrivals, category grid, brand story, testimonials, newsletter.
2. **Shop / Catalog** — Filters (category, room, material, color, price, in-stock), sort, grid/list view, infinite scroll, quick-view.
3. **Product Detail** — Gallery with zoom, variant selector, stock indicator, delivery estimate by ZIP, related products, reviews.
4. **Categories** — Living Room, Bedroom, Dining, Office, Outdoor, Lighting, Decor.
5. **Collections / Lookbook** — Editorial shoppable pages.
6. About, Sustainability, Showrooms, Blog, Contact, FAQ.

### Customer Account
- Register/Login (email + Google OAuth)
- Profile, addresses, order history, tracking, wishlist, reviews.

### Checkout Flow
- Multi-step: Cart → Shipping → Delivery → Payment → Review → Confirmation
- Guest checkout, promo codes, tax & shipping calc
- Stripe Elements + PayPal
- Order confirmation email

### Delivery System
- Tiers: standard, express, white-glove assembly
- ZIP-based availability & pricing
- Status: Pending → Confirmed → Packed → Shipped → Out for Delivery → Delivered
- Tracking timeline page
- Delivery slot booking for large items

### Admin Dashboard (`/admin`)
- Stats, Products CRUD, Categories, Orders, Customers, Coupons, Reviews moderation, Settings.

---

## Backend API Structure
```
/api/v1
  /auth /products /categories /collections /cart /wishlist
  /orders /payments /shipping /reviews /users /admin/* /upload
```
Includes: rate limiting, helmet, CORS, logging, error handler, OpenAPI docs.

---

## Database (Prisma)
`User, Address, Product, ProductVariant, Category, Collection, CartItem, WishlistItem, Order, OrderItem, Payment, Shipment, Review, Coupon, ShippingZone`.

---

## Template-Friendly Architecture
- Component-driven, prop-driven sections (swappable for Framer/ThemeForest templates)
- Theme tokens in `tailwind.config.ts` (single source of truth)
- CMS-ready content (admin or JSON config)
- Slot-based layouts
- Strict separation: presentational (`/components/ui`) vs feature (`/features/*`)

---

## Deliverables
1. Monorepo (`/client`, `/server`, `/shared`) — `docker-compose up` works
2. Seed script with 50+ realistic furniture products
3. `.env.example` for both apps
4. README with setup, deployment, architecture
5. Postman collection
6. Demo admin + customer pre-seeded

---

## Acceptance Criteria
- Full purchase flow with Stripe test mode
- Admin add product → live on storefront
- Order placed → status flow → email + tracking
- Lighthouse: Perf/A11y/SEO ≥ 95
- Zero TS errors, zero ESLint warnings
- Fully responsive, dark mode, 60fps animations

**Build it as if it will be sold as a premium template — every detail polished.**
