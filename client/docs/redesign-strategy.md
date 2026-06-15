# LVY — Redesign Strategy

> How each existing component and page should evolve to match the Brand Book **while preserving
> all functionality**. No `src/` code is changed by this document. Read alongside `design.md`
> and `brand-rules.md`.
>
> **Hard scope rule:** keep all business logic, API calls, routing, auth, and state management
> exactly as they are. Every note below is presentation-only.

---

## A. Key cross-cutting finding — content realignment

The codebase currently reads as a **furniture** brand ("Furniture you can turn around",
"FSC-certified hardwoods", "master woodworkers", "sofa/couch", founded-2014 stats). The Brand
Book is **LVY — handcrafted macramé & textile home décor**. The redesign should realign
**copy and imagery** toward the macramé/fiber-craft story and the LVY voice (Clarity, Softness,
Intention). This is a content/asset change, not a logic change — default copy lives in component
constants and CMS-backed `data` props, so it can be updated without touching behavior.

---

## B. Components (`src/components`)

> Each entry: **Preserve** (must not change) → **Redesign** (visual evolution).

### Navbar (`layout/Navbar.tsx`)
- **Preserve:** scroll hide/reveal, sticky behavior, cart/wishlist counts, mega-menu data
  queries, search overlay, mobile drawer, route-change close, body-scroll lock, all `aria-label`s.
- **Redesign:** map all colors to tokens (Terracotta → `#83382E`); keep transparent→Cream/95
  scroll transition; refine ticker copy to brand voice; ensure logo uses single-color wordmark per
  logo rules; confirm focus rings on all icon buttons; tune mega-menu shadow to `shadow-md`.

### Footer (`layout/Footer.tsx`)
- **Preserve:** links, structure, any newsletter/form wiring.
- **Redesign:** Charcoal/deep-neutral ground + Cream text; wordmark + "Elevate Your Space"
  tagline; uppercase column labels; hairline Cream/10 dividers; generous padding.

### Button (`ui/button.tsx`)
- **Preserve:** `cva` API, variants/sizes names, `asChild`/Slot, focus-visible ring.
- **Redesign:** confirm pill radius for primary/secondary; align `destructive` to Terracotta
  `#83382E`; add/confirm a Terracotta "primary-accent" usage; verify hover tokens (Walnut).

### ProductCard (`ui/ProductCard.tsx`)
- **Preserve:** link to `/product/:slug`, image/name/material/price fields, lazy loading.
- **Redesign:** keep flat 4:5 card; Serif title/price, Stone uppercase material; ensure
  `.product-card` 700ms hover scale; optional Terracotta sale badge + wishlist heart (visual only).

### Hero (`sections/Hero.tsx`, `HeroSection5.tsx`)
- **Preserve:** `data` prop fallbacks, 3D `Product3D` viewer, image rotation, CTAs/links.
- **Redesign:** Serif display headline with Terracotta/Sage accent word; uppercase eyebrow;
  realign default copy to macramé story; slow fade/parallax; single primary CTA.

### CategoryGrid (`sections/CategoryGrid.tsx`)
- **Preserve:** categories query, scroller logic, links.
- **Redesign:** 4:5 square-cornered tiles, Serif labels, ArrowRight hover reveal, Stone counts,
  "Curated spaces" eyebrow; token colors.

### FeaturedProducts / FeaturedShowcase (`sections/`)
- **Preserve:** featured products query, price/sale logic, scroll transforms.
- **Redesign:** consistent card spec (§8.3/8.6 of `design.md`); Serif prices; restrained motion;
  token colors; ensure "New in · Curated" eyebrow style.

### Story / StorySection (`sections/Story.tsx`, `StorySection.tsx`)
- **Preserve:** layout structure, links, scroll animations.
- **Redesign:** **realign pillar/stat copy from woodworking to macramé/fiber craft** (natural
  fibers, hand-knotted, small-batch, made-to-belong); editorial split; Serif headline, Sans body.

### Testimonials (`sections/Testimonials.tsx`)
- **Preserve:** structure.
- **Redesign:** keep Charcoal ground; Serif italic quotes; realign copy to textile/calm voice;
  Cream/60 attributions.

### Supporting (`ScrollScene`, `infinite-slider`, `progressive-blur`, `section-with-mockup`, `Product3D`, `Toaster`, `ReviewForm`, `admin/MediaPicker`)
- **Preserve:** all behavior, 3D/scroll mechanics, toast/store wiring, form submission.
- **Redesign:** color/spacing/radius tokens only; `ReviewForm` adopts form spec (§8.2);
  `Toaster` uses brand neutrals + Terracotta accent; admin gets light token alignment only.

---

## C. Pages (`src/pages`)

> Strategy only — no code yet. Functionality, data, and routes unchanged.

### Home (`Home.tsx`)
Section-driven (CMS `sections` with `FALLBACK`). Keep the registry/fallback logic. Redesign each
section via Component notes above; ensure consistent section rhythm and a single hero CTA; realign
default copy to macramé story.

### Shop (`Shop.tsx`)
Keep product queries, filtering, category routing. Redesign: clean filter/sort bar (token forms),
consistent product grid (2-up mobile / 3–4 desktop), Sand skeletons, warm empty state, airy header
with eyebrow + Serif title.

### Product Detail (`ProductDetail.tsx`, 765 lines)
Keep gallery, variants, add-to-cart, wishlist, reviews, 3D/AR, related queries. Redesign: larger
imagery, sticky Serif info column, Terracotta/Charcoal primary CTA, accordion details, brand-styled
reviews, mobile sticky add-to-cart. Maximize whitespace.

### Cart (`Cart.tsx`)
Keep cart store, qty/remove logic, totals. Redesign: calm line items (4:5 thumb, Serif name, qty
stepper), Sand summary card, Terracotta checkout CTA, warm empty state → Shop.

### Checkout (`Checkout.tsx`)
Keep Stripe integration, form/validation, order creation. Redesign: quiet focused layout, token
inputs, sticky desktop summary, Stripe Elements themed to palette, Stone trust cues.

### Order Confirmation (`OrderConfirmation.tsx`)
Keep order lookup. Redesign: calm celebratory layout, Serif headline, order summary card, knot-mark
ornament, clear next steps, "Elevate Your Space" continue-shopping CTA.

### About (`About.tsx`, 14 lines — currently minimal)
Opportunity to build out the brand story page: heritage of macramé, craft pillars, photography,
the LVY voice. Editorial sections reusing Story/StorySection patterns.

### Account (`Account.tsx`, 436 lines)
Keep auth-gated data, orders, wishlist, profile forms, all store wiring. Redesign: calm dashboard,
token tabs/cards, brand forms, consistent empty states for orders/wishlist.

### Login / Register (`Login.tsx`, `Register.tsx`)
Keep auth flows and validation. Redesign: centered editorial split (form + brand image/quote),
token inputs, single primary CTA, links in brand style.

### Shipping (`Shipping.tsx`, 721 lines)
Keep content/structure. Redesign: editorial long-form layout, Serif section heads, generous
spacing, token tables/cards, brand imagery.

### Not Found (`NotFound.tsx`)
Redesign: warm minimal 404, Serif line, knot-mark, single CTA home.

### Admin (`pages/admin/*`)
Internal tooling — **lowest priority**. Apply light token alignment (colors/spacing) for
consistency; do not restructure. Preserve all CRUD/data behavior.

---

## D. Token system (`tailwind.config.ts` + `globals.css`)

> **Target** configuration for Phase 1. **Do not apply yet** — documented for approval.

### D.1 Current state
`tailwind.config.ts` defines: `cream #F6F1EA`, `sand #EADFCE`, `terracotta #C2613B`,
`walnut #5B3A21`, `charcoal #1C1B19`, `sage #8A9A82`, `muted #8B847C`; fonts `display`
(Instrument Serif) / `sans` (Instrument Sans); `tracking-tightest -0.04em`; `ease-soft`.
`globals.css` sets base body/heading styles and `.btn`, `.link-underline`, `.product-card`,
`.section` utilities.

### D.2 Changes required (Brand Book alignment)
- **Re-point** `terracotta` `#C2613B` → **`#83382E`** (Brand Book canonical).
- **Re-point** `sage` `#8A9A82` → **`#708058`** (Brand Book canonical).
- **Add** `clay` **`#A38270`** (Brand Book canonical, currently missing).
- **Keep** `cream`, `sand`, `charcoal`, `walnut`, `muted` (the inferred warm foundation).
- **Add** `ink #000000` and `paper #FFFFFF` for true black/white when needed.

### D.3 Proposed semantic tokens
```
primary      → #83382E  (terracotta)
secondary    → #708058  (sage)
accent       → #A38270  (clay)
background   → #F6F1EA  (cream)
surface      → #FFFFFF  / #EADFCE (white / sand)
text         → #1C1B19  (charcoal)
muted        → #8B847C  (stone)
border       → rgba(28,27,25,0.12)
success      → #708058  (sage)
warning      → #A38270  (clay)
destructive  → #83382E  (terracotta)
```

### D.4 Proposed scales
- **Radius:** `sm 4px`, `md 8px`, `lg 16px`, `full 9999px`.
- **Shadow:** `xs/sm/md/lg` per `design.md §7` (warm, diffuse, Charcoal-based alphas).
- **Spacing:** rely on Tailwind's 4px scale; restrict usage to 4/8/12/16/24/32/48/64/96/128.
- **Typography:** add fluid `clamp()` font-size utilities matching `design.md §4.1` (optional).

### D.5 Implementation approach (for Phase 1, on approval)
1. Extend `theme.extend.colors` with semantic names mapped to brand hex (keep existing names as
   aliases to avoid breaking current classes; migrate gradually).
2. Add `borderRadius`, `boxShadow` extensions.
3. Update `globals.css` `@layer components` utilities to reference tokens.
4. Sweep `src/` for hardcoded colors/radii/shadows → replace with tokens (visual-only diffs).
5. Verify build, then run `ui-checklist.md` per page.

> Backwards-compatible aliasing means existing class names (`bg-terracotta`, `text-sage`) keep
> working while their values shift to the Brand Book palette — minimizing churn and risk.
