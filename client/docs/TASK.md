# LVY Redesign — Task Plan

> Master checklist for the brand-aligned redesign. Implementation is **not started**.
> Constraints (do not break): no changes to business logic, APIs, routing, auth, or state
> management. Visual/design layer only. See `brand-rules.md` and `design.md`.

## Phase 0 — Preparation (this deliverable)

- [x] Analyze Brand Book
- [x] Inspect source code (`src/components`, `src/pages`, `tailwind.config.ts`, `globals.css`)
- [x] Build Design System (`docs/design.md`)
- [x] Define brand rules (`docs/brand-rules.md`)
- [x] Define UI checklist (`docs/ui-checklist.md`)
- [x] Define redesign strategy + token plan (`docs/redesign-strategy.md`)
- [ ] **Get approval before any `src/` changes**

## Phase 1 — Foundation / Tokens

- [ ] Update Tailwind theme (`tailwind.config.ts`) with brand tokens
- [ ] Re-point `terracotta` → `#83382E`, `sage` → `#708058`; add `clay #A38270`
- [ ] Add semantic tokens (primary/secondary/accent/background/surface/text/muted/border/success/warning/destructive)
- [ ] Add radius, shadow, spacing tokens
- [ ] Update `src/styles/globals.css` base layer & component utilities to tokens
- [ ] Confirm typography (Instrument Serif / Instrument Sans) loading & features
- [ ] Replace Colors (audit every hardcoded color → token)
- [ ] Replace Typography (audit every font usage → scale)

## Phase 2 — Global Components

- [ ] Redesign Navbar
- [ ] Redesign Footer
- [ ] Redesign Buttons (`ui/button.tsx`) to brand variants
- [ ] Update Forms (inputs, `ReviewForm`, validation styling)
- [ ] Redesign Product Cards (`ui/ProductCard.tsx`)
- [ ] Redesign Hero (`sections/Hero.tsx`, `HeroSection5.tsx`)
- [ ] Redesign Category Grid (`sections/CategoryGrid.tsx`)
- [ ] Redesign Featured Products / Featured Showcase
- [ ] Redesign Story / Story Section (realign copy to macramé craft)
- [ ] Redesign Testimonials (realign copy/voice)
- [ ] Review ScrollScene / 3D / infinite-slider / progressive-blur for brand fit

## Phase 3 — Pages

- [ ] Redesign Home
- [ ] Redesign Shop
- [ ] Redesign Product Detail
- [ ] Redesign Cart
- [ ] Redesign Checkout
- [ ] Redesign About
- [ ] Redesign Account
- [ ] Redesign Login
- [ ] Redesign Register
- [ ] Redesign Shipping
- [ ] Redesign Order Confirmation
- [ ] Review Admin pages (light brand alignment only — internal tooling, lower priority)

## Phase 4 — States & Content

- [ ] Update Empty States (cart, wishlist, search, orders) — warm, on-brand
- [ ] Update Loading States (Sand skeletons, no layout shift)
- [ ] Update Hover/Focus/Active states to brand motion
- [ ] Realign marketing copy to macramé/textile voice ("Elevate Your Space")
- [ ] Replace/curate imagery to brand photography direction

## Phase 5 — Responsive

- [ ] Update Mobile (drawer, bottom CTAs, 2-up grids, tap targets)
- [ ] Verify Tablet layouts
- [ ] Verify Desktop layouts (mega-menu, sticky summaries)

## Phase 6 — Quality

- [ ] Accessibility Review (contrast, focus, semantics, reduced-motion, keyboard)
- [ ] Cross-browser / device pass
- [ ] Run `ui-checklist.md` for every page
- [ ] Final Design Audit against `brand-rules.md`
- [ ] Confirm no functional/API/route/auth/state regressions
