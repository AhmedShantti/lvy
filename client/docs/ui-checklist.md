# LVY — Per-Page UI Checklist

> Run this checklist against **every page** during and after the redesign. Each page must pass
> all items before it's considered done. Pair with `brand-rules.md` and `design.md`.

## Universal checklist (apply to each page)

For every page, verify:

- [ ] **Colors** — only brand palette + neutral foundation; correct semantic tokens; ~70/20/10 ratio
- [ ] **Typography** — Serif headings / Sans body; correct scale; eyebrow style intact; no third font
- [ ] **Hero / lead area** — editorial, airy, one CTA, on-brand copy
- [ ] **Buttons** — correct variant; pill radius; one primary action; hover/focus correct
- [ ] **Cards** — flat, 4:5 imagery, Serif title/price, 700ms hover scale
- [ ] **Forms** — token inputs, visible focus, error styling, 44px targets, labels associated
- [ ] **Icons** — Lucide, thin stroke, inherit color, accent only when active
- [ ] **Images** — brand photography direction; correct ratios; alt text present
- [ ] **Animations** — soft ease, correct durations, reduced-motion respected
- [ ] **Mobile** — single column, drawer, sticky CTA where relevant, 2-up grids, tap targets
- [ ] **Tablet** — layout intact at md; nav/grids adapt
- [ ] **Desktop** — mega-menu, multi-column, sticky summaries, hover affordances
- [ ] **Accessibility** — AA contrast, focus rings, semantics, keyboard, alt text
- [ ] **Loading states** — Sand skeletons, no layout shift
- [ ] **Empty states** — warm, on-brand line + one CTA
- [ ] **Hover states** — subtle (scale/underline/arrow), no color explosions
- [ ] **Responsive** — fluid type/spacing, ≤70ch body, no overflow at any breakpoint
- [ ] **Brand consistency** — reuses tokens/patterns; no per-page invention; matches `design.md`

---

## Page-by-page sign-off

Tick a page only when the full universal checklist above passes for it.

- [ ] **Home** (`/`)
- [ ] **Shop** (`/shop`, `/shop/:category`)
- [ ] **Product Detail** (`/product/:slug`)
- [ ] **Cart** (`/cart`)
- [ ] **Checkout** (`/checkout`)
- [ ] **Order Confirmation** (`/order/:number`)
- [ ] **About** (`/about`)
- [ ] **Account** (`/account`)
- [ ] **Login** (`/login`)
- [ ] **Register** (`/register`)
- [ ] **Shipping** (`/shipping`)
- [ ] **Not Found** (`*`)
- [ ] **Admin** (`/admin/*`) — light brand alignment, internal tooling

---

## Component sign-off

- [ ] Navbar · [ ] Footer · [ ] Button · [ ] ProductCard · [ ] Hero · [ ] HeroSection5
- [ ] CategoryGrid · [ ] FeaturedProducts · [ ] FeaturedShowcase · [ ] Story · [ ] StorySection
- [ ] Testimonials · [ ] ScrollScene · [ ] ReviewForm · [ ] Toaster · [ ] infinite-slider
- [ ] progressive-blur · [ ] section-with-mockup · [ ] Product3D

---

## Final audit gate

- [ ] Every page checkbox above is ticked
- [ ] No color/type/spacing/radius/shadow rule violations (`brand-rules.md`)
- [ ] No regressions to logic, APIs, routing, auth, or state
- [ ] Site reads as "the same website, evolved" — not a different site
