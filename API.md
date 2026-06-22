# LVY — API Reference

| | |
|---|---|
| **Base URL (dev)** | `http://localhost:4000/api/v1` |
| **Base URL (client env)** | `import.meta.env.VITE_API_URL` (defaults to the above) |
| **Content type** | `application/json` (except Stripe webhook → raw) |
| **Auth scheme** | `Authorization: Bearer <accessToken>` |
| **Version** | v1 |

A standalone health probe lives **outside** the versioned router: `GET /health` → `{ "ok": true, "service": "lvy-api" }`.

---

## 1. Conventions

### Authentication
- Obtain tokens from `POST /auth/login` or `/auth/register`.
- Send the **access token** as `Authorization: Bearer <token>` on protected routes.
- Access token TTL: `15m` (configurable via `JWT_EXPIRES_IN`). Refresh token TTL: `7d`.
- Refresh via `POST /auth/refresh` to get a new access/refresh pair.
- JWT payload: `{ sub: <userId>, role: "CUSTOMER" | "ADMIN" }`.

**Access levels used below**
- **Public** — no token required.
- **Optional** — works anonymously; attaches the user if a valid token is present.
- **Auth** — valid access token required (`requireAuth`).
- **Admin** — valid token **and** `role === "ADMIN"` (`requireAuth` + `requireAdmin`).

### Response envelopes
- Single resource: `{ "<resource>": {...} }` (e.g. `{ "product": {...} }`).
- Collections (unpaginated): `{ "items": [...] }`.
- Collections (paginated): `{ "items": [...], "total": <n>, "page": <n>, "pages": <n> }`.
- Mutations with no body: `{ "ok": true }`.

### Pagination
Query params `page` (default `1`) and `limit` (per-endpoint max). Response includes `total` and `pages`.

### Errors
Central handler. JSON body always has an `error` string.

| Status | Meaning | Body |
|---|---|---|
| `400` | Bad request / business rule | `{ "error": "..." }` |
| `401` | Missing/invalid token, bad credentials | `{ "error": "Unauthorized" }` |
| `403` | Authenticated but not allowed | `{ "error": "Forbidden" }` |
| `404` | Not found | `{ "error": "..." }` |
| `409` | Conflict (duplicate, already claimed) | `{ "error": "..." }` |
| `422` | Zod validation failure | `{ "error": "Validation failed", "issues": [...] }` |
| `500` | Server error | `{ "error": "Internal server error" }` |

### Money & dates
- Monetary fields are Prisma `Decimal` and serialize as **strings** in JSON (e.g. `"1299.00"`). Coerce with `Number(...)` client-side.
- Dates are ISO 8601 strings.

### Enums
- `Role`: `CUSTOMER`, `ADMIN`
- `OrderStatus`: `PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `REFUNDED`
- `PaymentStatus`: `PENDING`, `PAID`, `FAILED`, `REFUNDED`
- `DeliveryTier`: `STANDARD`, `EXPRESS`, `WHITE_GLOVE`

---

## 2. Auth — `/auth`

### POST `/auth/register` · Public
Create an account and return tokens.

**Body**
```json
{ "email": "jane@example.com", "password": "min8chars", "name": "Jane" }
```
**201/200**
```json
{
  "user": { "id": "c...", "email": "jane@example.com", "name": "Jane", "role": "CUSTOMER" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```
**Errors:** `409` email already registered · `422` validation.

### POST `/auth/login` · Public
**Body** `{ "email": "...", "password": "..." }`
**200** — same shape as register.
**Errors:** `401` invalid credentials.

### POST `/auth/refresh` · Public
**Body** `{ "refreshToken": "eyJ..." }`
**200** `{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }`
**Errors:** `401` invalid refresh token.

### GET `/auth/me` · Auth
**200**
```json
{ "user": { "id": "c...", "email": "...", "name": "...", "role": "CUSTOMER", "phone": null, "addresses": [...] } }
```

---

## 3. Products — `/products` (Public)

### GET `/products`
List/search the catalog.

**Query**
| Param | Type | Notes |
|---|---|---|
| `q` | string | name contains (case-insensitive) |
| `category` | string | category **slug** |
| `minPrice`, `maxPrice` | number | price range |
| `sort` | enum | `new` (default) · `price_asc` · `price_desc` · `rating` |
| `page` | number | default `1` |
| `limit` | number | default `12`, max `48` |
| `featured` | boolean | filter featured |

**200**
```json
{
  "items": [ { "id": "c...", "name": "...", "slug": "...", "price": "1299.00",
    "images": ["/..."], "stock": 8, "featured": true, "category": { "id": "...", "name": "..." } } ],
  "total": 53, "page": 1, "pages": 5
}
```

### GET `/products/:slug`
**200**
```json
{
  "product": { "id":"...", "slug":"...", "category":{...}, "variants":[...],
    "reviews":[ { "rating":5, "body":"...", "user":{"name":"..."} } ] },
  "related": [ {...}, {...} ]
}
```
Only **approved** reviews are included. **Errors:** `404`.

---

## 4. Categories — `/categories` (Public)

### GET `/categories`
**200**
```json
{ "items": [ { "id": "...", "name": "Living Room", "slug": "living-room",
  "image": "/...", "_count": { "products": 12 } } ] }
```

---

## 5. Cart — `/cart` (Auth)

### GET `/cart`
**200** `{ "items": [ { "id":"...", "quantity":2, "variant":null, "product": {...} } ] }`

### POST `/cart`
Add/increment an item (upsert on `userId + productId + variant`).
**Body**
```json
{ "productId": "c...", "quantity": 1, "variant": "Walnut / Large" }
```
`quantity` defaults to `1`; `variant` optional. **200** `{ "item": {...} }`.

### DELETE `/cart/:id`
**200** `{ "ok": true }`

---

## 6. Orders — `/orders`

### POST `/orders` · Optional auth (guest checkout supported)
Creates an order. Prices, shipping, tax, and discount are computed **server-side**.

**Body**
```json
{
  "email": "jane@example.com",
  "items": [ { "productId": "c...", "quantity": 2, "variant": "Walnut" } ],
  "address": { "fullName":"Jane Doe","line1":"1 Main St","line2":null,
    "city":"NYC","region":"NY","postal":"10001","country":"US","phone":"+1..." },
  "deliveryTier": "STANDARD",
  "couponCode": "WELCOME10",
  "notes": "Leave at door"
}
```

**Server pricing rules (current):**
- Shipping: `WHITE_GLOVE` → `199`; `EXPRESS` → `60`; `STANDARD` → free if subtotal ≥ `1500`, else `25`.
- Tax: `8%` of subtotal.
- Coupon: applied only if found and `active` (`percent` → % of subtotal; `fixed` → flat). Increments `usedCount`.

**200**
```json
{ "order": { "number": "LVY-XXXX-XXXX", "email": "...", "subtotal": 2598, "shipping": 0,
  "tax": 207.84, "discount": 259.8, "total": 2546.04, "status": "PENDING",
  "paymentStatus": "PENDING", "items": [...], "shipment": {...} } }
```
**Errors:** `400` invalid items · `422` validation.

### GET `/orders/mine` · Auth
**200** `{ "items": [ {...orders with items+shipment...} ] }`

### POST `/orders/claim` · Auth
Link a guest order to the logged-in account (e.g. after registering).
**Body** `{ "number": "LVY-...", "email": "jane@example.com" }`
**200** `{ "order": {...} }` or `{ "order": {...}, "alreadyClaimed": true }`.
**Errors:** `404` not found · `403` email mismatch · `409` linked to another account.

### GET `/orders/:number` · Public
Fetch one order by its public number (used by the confirmation/tracking page).
**200** `{ "order": { ...items, shipment } }` · **Errors:** `404`.

---

## 7. Payments — `/payments`

### POST `/payments/intent` · Public
Create a Stripe PaymentIntent for an existing order; stores `stripeId` on the order.
**Body** `{ "orderNumber": "LVY-..." }`
**200** `{ "clientSecret": "pi_..._secret_..." }`
**Errors:** `500` Stripe not configured · `404` order not found.

### POST `/payments/webhook` · Public (Stripe-signed, **raw body**)
Consumes Stripe events. On `payment_intent.succeeded`, sets the order to `paymentStatus: PAID`, `status: CONFIRMED`.
- Requires header `stripe-signature` and `STRIPE_WEBHOOK_SECRET`.
- **200** `{ "received": true }` · **400** on signature verification failure.

---

## 8. Shipping — `/shipping` (Public)

### POST `/shipping/quote`
Returns delivery rates and ETAs.
> ⚠️ **Current behavior:** rates are computed from a hardcoded postal-prefix rule, **not** from the admin `ShippingZone` records (see PRD §13 / roadmap M1).

**Body** `{ "postal": "10001", "subtotal": 1200 }`
**200**
```json
{ "standard": 25, "express": 60, "whiteGlove": 199,
  "etaDays": { "standard": "5-8", "express": "2-3", "whiteGlove": "7-14" } }
```

---

## 9. Reviews — `/reviews`

### POST `/reviews` · Auth
Submit a review (starts unapproved; one per user per product).
**Body** `{ "productId": "c...", "rating": 5, "title": "Stunning", "body": "..." }` (`rating` 1–5; `body` ≤ 2000 chars)
**201** `{ "review": { ...includes user.name } }`
**Errors:** `404` product · `409` already reviewed · `422` validation.

### GET `/reviews/mine` · Auth
**200** `{ "items": [ { "rating":5, "approved":false, "product": { "name","slug","images" } } ] }`

---

## 10. Content — `/content` (Public)

### GET `/content/:slug`
Returns a CMS page with its **enabled** sections ordered by `order`. Requesting `home` auto-seeds default sections the first time.
**200**
```json
{ "page": { "slug":"home","title":"Home",
  "sections":[ { "id":"...","type":"hero","order":0,"enabled":true,"data":{...} } ] } }
```
**Errors:** `404` page not found (non-home slugs).

---

## 11. Admin — `/admin/*` (Admin only)

All routes below require `Authorization: Bearer <admin token>`. Non-admins receive `403`; missing token `401`.

### Dashboard & stats
| Method | Path | Description | Response |
|---|---|---|---|
| GET | `/admin/dashboard` | KPI summary | `{ totalOrders, totalRevenue, totalUsers, totalProducts, recentOrders[], lowStockProducts[] }` |
| GET | `/admin/stats` | Quick counts | `{ orders, customers, products, revenue }` |
| GET | `/admin/stats/timeseries?days=30` | Charts data | `{ series[], topItems[], byStatus[], lowStock[] }` (`days` 7–365) |

### Products
| Method | Path | Body / Query | Notes |
|---|---|---|---|
| GET | `/admin/products` | `?q&page&limit` (max 100) | paginated; includes `category`, variant count |
| POST | `/admin/products` | product fields | see body below |
| PUT | `/admin/products/:id` | partial product | |
| DELETE | `/admin/products/:id` | — | `{ ok: true }` |
| PATCH | `/admin/products/:id/featured` | — | **toggles** `featured` |
| PATCH | `/admin/products/:id/new` | — | **toggles** `isNew` |

**Product body**
```json
{ "name":"...","slug":"...","description":"...","price":1299,"compareAt":1499,
  "images":["/a.jpg"],"categoryId":"c...","stock":10,
  "material":"Oak","color":"Walnut","dimensions":"200x90","featured":false,"isNew":true }
```

### Product variants
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/variants?productId=` | list for a product |
| POST | `/admin/variants` | `{ productId, name, sku, color?, size?, price, stock }` |
| PUT | `/admin/variants/:id` | partial |
| DELETE | `/admin/variants/:id` | |

### Categories
| Method | Path | Body |
|---|---|---|
| GET | `/admin/categories` | — (includes product counts) |
| POST | `/admin/categories` | `{ name, slug, description?, image? }` |
| PUT | `/admin/categories/:id` | partial |
| DELETE | `/admin/categories/:id` | |

### Collections
| Method | Path | Body |
|---|---|---|
| GET | `/admin/collections` | — (includes product counts) |
| POST | `/admin/collections` | `{ name, slug, description?, cover? }` |
| PUT | `/admin/collections/:id` | partial |
| DELETE | `/admin/collections/:id` | |

### Orders
| Method | Path | Body / Query | Notes |
|---|---|---|---|
| GET | `/admin/orders` | — | latest 100, with items+shipment |
| GET | `/admin/orders-paged` | `?q&status&page&limit` | paginated table |
| GET | `/admin/orders/:id` | — | full detail (items, address, user, shipment) |
| GET | `/admin/orders.csv` | — | CSV download (max 1000) |
| PATCH | `/admin/orders/:id/status` | `{ status: OrderStatus }` | |
| PATCH | `/admin/orders/:id/payment` | `{ paymentStatus: PaymentStatus }` | |
| PATCH | `/admin/orders/:id/notes` | `{ notes: string }` (≤1000) | internal notes |
| POST | `/admin/orders/:id/refund` | — | sets status+payment to `REFUNDED` (Stripe call stubbed) |

### Users
| Method | Path | Body / Query | Notes |
|---|---|---|---|
| GET | `/admin/users` | `?q&role&page&limit` | all roles; includes order/review counts |
| GET | `/admin/users/:id` | — | with addresses + orders |
| PATCH | `/admin/users/:id/role` | `{ role: "CUSTOMER" \| "ADMIN" }` | **guard:** cannot demote the last admin (`400`) |

### Customers (CUSTOMER-role view)
| Method | Path | Query | Notes |
|---|---|---|---|
| GET | `/admin/customers` | `?q&page&limit` | includes order/review counts + lifetime value |
| GET | `/admin/customers/:id` | — | orders, addresses, reviews |

### Coupons
| Method | Path | Body |
|---|---|---|
| GET | `/admin/coupons` | — |
| POST | `/admin/coupons` | `{ code, type:"percent"\|"fixed", value, minTotal?, expiresAt?, active? }` |
| PUT | `/admin/coupons/:id` | partial |
| DELETE | `/admin/coupons/:id` | |
| PATCH | `/admin/coupons/:id/toggle` | — (**toggles** `active`) |

### Reviews moderation
| Method | Path | Body / Query | Notes |
|---|---|---|---|
| GET | `/admin/reviews` | `?status=pending\|approved\|all` | with user + product |
| PATCH | `/admin/reviews/:id/approve` | — | approve + recompute rating |
| PATCH | `/admin/reviews/:id/reject` | — | unpublish + recompute rating |
| DELETE | `/admin/reviews/:id` | — | delete + recompute rating |
| POST | `/admin/reviews/bulk-approve` | `{ ids: string[] }` | |

### Shipping zones
| Method | Path | Body |
|---|---|---|
| GET | `/admin/shipping-zones` | — |
| POST | `/admin/shipping-zones` | `{ name, postalPrefix, standard, express, whiteGlove }` |
| PUT | `/admin/shipping-zones/:id` | partial |
| DELETE | `/admin/shipping-zones/:id` | |

### Settings
| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/admin/settings` | — | merged with defaults → `{ settings: {...} }` |
| PUT | `/admin/settings` | `{ <key>: <value>, ... }` | bulk upsert |
| PUT | `/admin/settings/:key` | `{ value: <any> }` | single upsert |

### Content (CMS)
| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/admin/content/pages` | — | pages + section counts |
| GET | `/admin/content/pages/:slug` | — | page + ordered sections (auto-seeds `home`) |
| PUT | `/admin/content/sections/:id` | `{ data?, enabled?, order? }` | |
| POST | `/admin/content/pages/:slug/reset` | — | `home` only — restore defaults |

### Media
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/media` | lists image files in `client/public` → `{ items: [{ name, url }] }` |

---

## 12. Quick Examples (cURL)

**Login**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lvy.shop","password":"admin1234"}'
```

**Authenticated admin call**
```bash
TOKEN="<accessToken>"
curl http://localhost:4000/api/v1/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

**Create a product**
```bash
curl -X POST http://localhost:4000/api/v1/admin/products \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Aalto Sofa","slug":"aalto-sofa","description":"...","price":1899,
       "images":["/aalto.jpg"],"categoryId":"<catId>","stock":5,"featured":true}'
```

**Place a guest order**
```bash
curl -X POST http://localhost:4000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"email":"guest@example.com",
       "items":[{"productId":"<id>","quantity":1}],
       "address":{"fullName":"Guest","line1":"1 St","city":"NYC","region":"NY",
                  "postal":"10001","country":"US","phone":"+1"},
       "deliveryTier":"STANDARD"}'
```

---

## 13. Notes & Known Gaps
- **Shipping quote** ignores `ShippingZone` records (hardcoded). Wiring planned (PRD M1).
- **Refunds** flip order status but do not yet call Stripe.
- **Not yet implemented:** `/wishlist`, `/upload` (Cloudinary), public `/collections`, PayPal, password reset, Google OAuth, OpenAPI/Swagger docs.
- **Rate limiting:** all routes share a global limiter of **200 requests / minute / IP**.
- **CORS:** restricted to `CLIENT_URL` (comma-separated allowed), credentials enabled.
