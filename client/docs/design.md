# LVY — Design System

> Single source of truth for the LVY brand-aligned redesign.
> Derived entirely from `lvy-brand-book.pdf` and `LVY-LOGO.svg`. Where the Brand Book is
> silent, values are **inferred conservatively** from its palette, mockups and photography
> (such inferences are marked _inferred_).
>
> **Status:** specification only. No source code has been changed. See `brand-rules.md`
> for hard constraints and `TASK.md` for the implementation plan.

---

## 1. Brand Foundation

**LVY** is a premium house of **handcrafted macramé and textile home décor**. Macramé is one
of the oldest forms of textile art — skilled artisans using intricate knotting techniques,
dating back centuries — reinterpreted here for the contemporary home.

**Brand personality:** calm, intentional, handmade, warm, quietly premium, timeless.

**Brand values:** craftsmanship · honest materials · patience · intention · timeless beauty ·
sustainability of slow making.

**Positioning statement (from the Brand Book):** _"With a commitment to high-quality materials
and thoughtful design, LVY represents a seamless fusion of history and modern lifestyle — a
distinctive name in contemporary décor."_

**Core messaging:**

- LVY is built on the essence of **calm, craftsmanship, and timeless beauty**.
- We create handcrafted macramé pieces that bring **softness and balance** into modern spaces —
  _where design is not loud, but deeply felt._
- Our message is simple: **thoughtful design, honest materials, and quiet elegance.**
- Every piece is a reflection of **care, patience, and intention — made to last, and made to belong.**
- LVY is not just décor. It is **a way of living — slower, calmer, and more meaningful.**

**Emotional direction:** the feeling of a calm, sunlit room — warmth, stillness, tactility, and
quiet confidence. Never busy, never shouting.

**Premium feeling** comes from restraint: generous whitespace, slow motion, soft natural light,
tactile materials, and disciplined use of a small palette — not from ornament or effects.

**Tone of voice:** **Clarity. Softness. Intention.** _No noise. No clutter._
Short, considered sentences. Sensory and human, never salesy.

**Taglines / signature lines** (use verbatim, do not invent new ones):

- **Elevate Your Space** (primary)
- Crafted for Calm
- Made by Hand, Felt by Soul
- Handcrafted Macramé, Made with Care
- Quietly Crafted. Deeply Felt.

---

## 2. Logo

The logo pairs a **geometric radiating "knot" mark** (an eight-point asterisk/starburst that
evokes a tied macramé node) with the **LVY serif wordmark** (note the accented `Ý`).

**Usage**

- Primary lockups: mark + wordmark stacked, or wordmark alone in the navbar.
- Render in a **single brand color only**: Charcoal/Black on light grounds; Cream/White on dark
  or photographic grounds. Never multi-color, never gradient.
- **Clear space:** keep a minimum margin equal to the cap-height of the wordmark on all sides.
- **Minimum size:** wordmark ≥ 24px tall on screen; mark ≥ 20px.
- **Do not:** stretch, rotate, recolor outside the palette, add shadows/outlines/effects, place
  on low-contrast or busy areas of imagery, or recreate the wordmark in a different typeface.

---

## 3. Color

### 3.1 Brand palette (canonical — from the Brand Book)

| Token name | Hex | Role |
|---|---|---|
| Ink / Black | `#000000` | Maximum-contrast text, dark sections |
| Paper / White | `#FFFFFF` | Pure white surfaces, reversed text |
| Terracotta | `#83382E` | Primary brand accent (CTAs, highlights, links) |
| Sage | `#708058` | Secondary accent (natural, supportive) |
| Clay | `#A38270` | Tertiary / warm neutral accent |

These five are the **only** sanctioned hues. Everything else is a tint/shade of these or a
neutral from the foundation scale below.

### 3.2 Neutral foundation (_inferred_ from mockups & photography)

The Brand Book's mockups and photography sit on warm, paper-like neutrals with charcoal for
dark grounds. These warm neutrals are inferred to make the five hues usable as a full UI system.

| Token | Hex | Role |
|---|---|---|
| Cream | `#F6F1EA` | Default page background |
| Sand | `#EADFCE` | Subtle surfaces, hovers, dividers fill |
| Charcoal | `#1C1B19` | Primary text & dark sections (near-black, warmer than `#000`) |
| Stone (muted) | `#8B847C` | Secondary/muted text, captions |
| Walnut | `#5B3A21` | Deep accent / pressed states (_inferred from Clay/Terracotta family_) |

> Migration note: the current code already ships `cream`, `sand`, `charcoal`, `walnut`, `muted`,
> plus `terracotta #C2613B` and `sage #8A9A82`. The redesign **re-points** `terracotta` →
> `#83382E` and `sage` → `#708058` to match the Brand Book, and adds `clay #A38270`. See
> `redesign-strategy.md §Tokens`.

### 3.3 Semantic tokens (target system)

| Semantic | Maps to | Notes |
|---|---|---|
| `primary` | Terracotta `#83382E` | Primary actions, brand accent |
| `secondary` | Sage `#708058` | Secondary actions, natural tags |
| `accent` | Clay `#A38270` | Warm highlights, badges |
| `background` | Cream `#F6F1EA` | App background |
| `surface` | White `#FFFFFF` / Sand `#EADFCE` | Cards, sheets, raised areas |
| `text` | Charcoal `#1C1B19` | Body & headings |
| `muted` | Stone `#8B847C` | Secondary text |
| `border` | Charcoal @ 10–20% | Hairline dividers, inputs |
| `success` | Sage `#708058` | Confirmations (reuse brand sage) |
| `warning` | Clay `#A38270` | Cautions (reuse brand clay) |
| `destructive` | Terracotta `#83382E` | Errors / destructive (reuse brand terracotta) |

> Success/warning/destructive intentionally reuse brand hues so the UI never introduces
> off-brand "system" colors. Differentiate states with icon + copy, not new colors.

### 3.4 Usage ratios

Roughly **70% neutral** (Cream/White/Sand) · **20% Charcoal/Ink** · **10% accents**
(Terracotta > Sage > Clay). Terracotta is precious — reserve it for the single most important
action per view.

### 3.5 Contrast

All text must meet **WCAG AA** (4.5:1 body, 3:1 large/UI). Verified pairings:
Charcoal on Cream ✓ · Cream on Charcoal ✓ · Cream on Terracotta ✓ · Cream on Sage ✓.
Clay `#A38270` on Cream is **decorative only** (fails AA for body text) — never use Clay for
small text on light grounds.

---

## 4. Typography

Two families, mirroring the Brand Book (serif wordmark + clean grotesque body):

- **Display — `Instrument Serif`** (serif). Headings, hero, product names, prices.
  Set tight: `letter-spacing: -0.04em` ("tightest"). Used for emotional, editorial moments.
- **Body / UI — `Instrument Sans`** (humanist grotesque). Paragraphs, labels, nav, buttons,
  forms, data.

> These match the existing stack and the Brand Book's serif-display / grotesque-body pairing.
> Do not introduce a third typeface.

### 4.1 Type scale (fluid, _inferred_ to extend Brand Book hierarchy)

| Role | Family | Size (desktop) | Line height | Tracking |
|---|---|---|---|---|
| Display / Hero | Serif | `clamp(3rem, 7vw, 6rem)` | 1.0–1.05 | -0.04em |
| H1 | Serif | `clamp(2.5rem, 5vw, 4rem)` | 1.05 | -0.04em |
| H2 | Serif | `clamp(2rem, 3.5vw, 3rem)` | 1.1 | -0.03em |
| H3 | Serif | `1.5rem` | 1.2 | -0.02em |
| Body L | Sans | `1.125rem` | 1.6 | 0 |
| Body | Sans | `1rem` | 1.6 | 0 |
| Small | Sans | `0.875rem` | 1.5 | 0 |
| Eyebrow / Label | Sans | `0.625–0.75rem` | 1.4 | **0.3em, UPPERCASE** |

**Signature eyebrow style:** tiny, uppercase, letter-spaced `0.3em`, often in Terracotta or
Stone — used above section titles (already a pattern in the codebase; keep it).

Body uses OpenType features `ss01`, `cv11`; headings use `ss01` (preserve existing settings).

---

## 5. Spacing & Layout

**Philosophy:** generous, calm, grid-disciplined. Whitespace is the primary luxury signal.
"No clutter" — never fill space just because it exists.

- **Spacing scale (4px base):** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- **Section rhythm:** `py-20` mobile → `py-32` desktop (existing `.section`). Keep large.
- **Container:** centered, padding `1.25rem` → `2rem` (lg), max width **1440px** (existing).
- **Grids:** 12-column thinking; product grids 2-up mobile / 3–4-up desktop; editorial
  split-screens 1:1 on desktop, stacked on mobile.
- **Image ratios:** portrait **4:5** for product/category, **1:1** for secondary tiles,
  cinematic **16:9 / 3:2** for hero and story imagery (matches Brand Book photo grids).

---

## 6. Radius

Soft but architectural — echoing the Brand Book's **arched/rounded-top** mockups without
becoming bubbly. Use **one** system; never mix.

| Token | Value | Use |
|---|---|---|
| `none` | 0 | Editorial images, full-bleed media |
| `sm` | 4px | Inputs, small chips |
| `md` | 8px | Cards, surfaces, dropdowns |
| `lg` | 16px | Large cards, modals, image masks |
| `full` | 9999px | Pills: primary/secondary buttons, badges, tags |

Default product/category imagery stays **square-cornered** (editorial); UI chrome uses `md`;
buttons and tags use `full`. _The "arch" motif from packaging may appear as a decorative image
mask on hero/story art, used sparingly._

---

## 7. Shadows & Elevation

Light, warm, diffuse — natural daylight, not hard UI drop-shadows. Never pure-black shadows.

| Token | Value | Use |
|---|---|---|
| `none` | — | Default (flat, on-brand) |
| `xs` | `0 1px 2px rgba(28,27,25,0.04)` | Hairline lift on hover |
| `sm` | `0 2px 8px rgba(28,27,25,0.06)` | Sticky navbar when scrolled |
| `md` | `0 8px 30px rgba(28,27,25,0.08)` | Dropdowns, mega-menu, popovers |
| `lg` | `0 24px 60px rgba(28,27,25,0.10)` | Modals, cart drawer |

Prefer **borders and background shifts** over shadows for separation wherever possible.

---

## 8. Components

> Visual spec only. Behavior, props, routing and data stay exactly as built today —
> see `redesign-strategy.md` for the per-component mapping.

### 8.1 Buttons

Pill-shaped (`rounded-full`), Sans medium, generous padding, soft 300ms ease transitions.

| Variant | Rest | Hover | Use |
|---|---|---|---|
| Primary | Charcoal bg / Cream text | Walnut bg | Main CTA (1 per view) |
| Primary-accent | Terracotta bg / Cream text | Terracotta 90% | Hero / "Add to cart" emphasis |
| Secondary | Sand bg / Charcoal text | Sand 80% | Supporting actions |
| Outline | Transparent, Charcoal 20% border | Charcoal bg / Cream text | Tertiary |
| Ghost | Transparent | Sand 60% | Toolbar / inline |
| Link | Underline-on-hover | animated underline | In-text |

Sizes: `sm` 36px · `default` 40px · `lg` 44px · `icon` 40×40. Focus ring: 2px Charcoal,
2px offset (preserve existing). Disabled: 50% opacity, no pointer events.

### 8.2 Forms

- Inputs: White/Cream fill, 1px Charcoal/15% border, `radius-sm`, comfortable 44px height.
- Focus: border → Charcoal, subtle 2px ring. Error: border → Terracotta + helper text.
- Labels: Sans small; uppercase micro-labels for compact forms. Placeholders in Stone.
- Validation messages live below the field, never replace the label. Min touch target 44px.

### 8.3 Cards

Flat by default: image (4:5) + Sand/40 placeholder, Serif title, Stone material label, Serif
price. Hover: image scales to 1.05 over 700ms ease-soft (existing `.product-card`), card itself
stays flat. Radius `md` for chrome cards; product imagery square-cornered.

### 8.4 Navbar

Sticky, hides on scroll-down / reveals on scroll-up. Transparent over hero → Cream/95 with
blur + hairline border + `shadow-sm` once scrolled. Rotating announcement ticker on Charcoal.
Centered uppercase letter-spaced nav links with animated underline. Mega-menu (shop by room +
collections + featured) on Cream/98 with `shadow-md`. Accent micro-labels in Terracotta.

### 8.5 Footer

Calm, spacious, Charcoal or deep-neutral ground with Cream text. Wordmark + tagline ("Elevate
Your Space"), grouped link columns (uppercase labels), newsletter capture, legal row. Generous
vertical padding; hairline dividers at Cream/10.

### 8.6 Product Cards

See 8.3. Optional: sale badge in Terracotta pill (top-left), wishlist heart (top-right),
quick price in Serif. Keep metadata minimal — name, material, price.

### 8.7 Hero

Editorial, image-led, lots of air. Serif display headline with Terracotta or Sage accent word;
small uppercase eyebrow ("Spring Collection · 2026" / "Elevate Your Space"); one primary CTA.
Supports the existing 3D product viewer and image rotation — keep, but ensure copy reflects the
**macramé craft** story, not generic furniture. Slow fade/parallax entrance.

### 8.8 Category Grid

Horizontal-scroll or grid of room/category tiles, 4:5 imagery, Serif labels, ArrowRight reveal
on hover, "N pieces" count in Stone. Eyebrow "Curated spaces". Square-cornered media.

### 8.9 Testimonials

Currently on Charcoal ground, centered Serif italic quotes. Keep dark, calm. Realign copy to
the textile/macramé voice ("Crafted for Calm" energy). One quote focal at a time or 3-up grid.

### 8.10 Story Section

Editorial split (image 4:5 + text), pillars (Sourced/Crafted/Finished/Delivered) and stats.
Realign pillar copy from woodworking to **macramé / fiber craft** (natural fibers, hand-knotted,
small-batch). Serif headline, Sans body, Stone eyebrow.

### 8.11 Product Detail

Gallery (left) + sticky info (right): Serif name, Serif price, material/dimensions, Sans
description, primary "Add to cart" (Terracotta or Charcoal), wishlist, accordion details,
reviews, related grid. Keep 3D/AR module if present. Maximize whitespace and image scale.

### 8.12 Cart

Calm line-item list: thumbnail (4:5), Serif name, qty stepper, price, remove (ghost). Order
summary card (Sand), prominent "Checkout" (Terracotta). Empty state: warm, illustrative, with
"Elevate Your Space" CTA back to Shop.

### 8.13 Checkout

Quiet, focused, minimal nav distraction. Stepped or single-column form using §8.2 inputs.
Order summary sticky on desktop. Stripe elements themed to match (Charcoal text, Sand fields,
Terracotta primary). Trust cues in Stone, not loud badges.

---

## 9. Responsive System

Mobile-first. Tailwind breakpoints: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1440`.

- **Mobile:** single column, full-bleed imagery, sticky bottom CTA on PDP/cart, hamburger +
  full-screen drawer, 2-up product grid, tap targets ≥ 44px.
- **Tablet:** 2–3 column grids, condensed nav, mega-menu may collapse to drawer.
- **Desktop:** full mega-menu, multi-column editorial, sticky summaries, hover affordances.

Type and spacing scale fluidly via `clamp()`. Never let line length exceed ~70ch for body.

---

## 10. Animation Guidelines

**Principle:** motion is soft, slow, and purposeful — "no noise." It should feel like light
moving across a room.

- **Standard easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (existing `ease-soft`).
- **Durations:** micro 150–300ms (hover, focus) · entrances 600–800ms · image zoom 700ms.
- **Patterns:** fade + 20px rise on scroll-in (`.fade-in`), image scale 1.05 on card hover,
  animated link underline (origin-right → origin-left), navbar reveal/hide, gentle parallax on
  hero/story art, cart-badge bounce on add.
- **Restraint:** one motion per interaction; no bounce/elastic on UI chrome; respect
  `prefers-reduced-motion` (disable transforms, keep opacity).

---

## 11. Iconography

- Library: **Lucide** (already used), thin/`1.5px` stroke, rounded — matches the soft aesthetic.
- Size 16–22px inline; never filled-heavy. Color inherits text (Charcoal/Stone), Terracotta only
  for active/accent.
- No multi-color or skeuomorphic icons. Decorative brand symbol = the LVY knot mark, used
  sparingly as a section ornament, not as a UI icon.

---

## 12. Illustration & Image Direction

**Photography (primary medium):**

- Warm natural daylight, soft long shadows, neutral interiors (plaster, linen, wood, stone).
- Tactile close-ups of macramé knots, fibers, textiles; lived-in, editorial, unstaged calm.
- Muted, warm grade aligned to the palette; avoid cool/blue casts, high saturation, hard flash.
- Subjects: textiles in real rooms, hands at craft, quiet still-life. People are serene, secondary.
- Composition: generous negative space; let the product breathe.

**Illustration / graphics:** minimal. Line work or the knot mark only, in single brand colors.
Avoid stock 3D, gradients, glassmorphism, or trendy effects.

**Image masks:** mostly square/rectangular; the packaging **arch** shape may be used occasionally
as a hero/story mask for a premium editorial accent.

---

## 13. Accessibility

- **Contrast:** WCAG **AA** minimum everywhere (see §3.5); Clay never used for small text on light.
- **Focus:** always-visible 2px focus ring (Charcoal), 2px offset. Never remove outlines.
- **Targets:** interactive elements ≥ 44×44px.
- **Semantics:** correct landmarks, heading order, `alt` text on all imagery, labelled inputs,
  `aria-label` on icon-only buttons (already present in navbar — preserve).
- **Motion:** honor `prefers-reduced-motion`.
- **Forms:** errors announced and associated via `aria-describedby`; never color-only signals.
- **Keyboard:** full keyboard operability for menus, drawers, dialogs; trap focus in overlays.

---

## 14. Component Patterns (cross-cutting)

- **Eyebrow → Serif title → Sans intro → content → single CTA** is the canonical section rhythm.
- **One primary action per view**; everything else is secondary/ghost.
- **Empty states:** warm, short, on-brand line + one CTA + optional knot-mark ornament.
- **Loading states:** Sand/40 skeletons with gentle pulse (existing pattern), never spinners on
  large layout; keep layout stable to avoid shift.
- **Hover states:** subtle — image scale, underline reveal, arrow nudge; never color explosions.
- **Selection:** `::selection` uses Terracotta bg / Cream text (existing — keep).
- **Consistency over novelty:** reuse these tokens and patterns; do not invent per-page styles.

---

_End of design system. Pair with `brand-rules.md` (constraints), `redesign-strategy.md`
(component/page mapping + tokens), `TASK.md` (plan) and `ui-checklist.md` (QA)._
