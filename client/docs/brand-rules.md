# LVY — Brand Rules (Hard Constraints)

> The Brand Book is the **only source of truth**. These rules are non-negotiable for every
> screen, component, and asset in the redesign. When in doubt, choose restraint.

## Color

1. **Never use a color outside the brand palette.** Allowed hues: Black `#000000`,
   White `#FFFFFF`, Terracotta `#83382E`, Sage `#708058`, Clay `#A38270`, plus the neutral
   foundation (Cream `#F6F1EA`, Sand `#EADFCE`, Charcoal `#1C1B19`, Stone `#8B847C`,
   Walnut `#5B3A21`). No other hex values.
2. **No off-brand "system" colors.** success/warning/destructive reuse Sage/Clay/Terracotta —
   never introduce generic blue/green/red/yellow.
3. **No random gradients, glows, or neon.** Flat brand color or warm photography only.
4. **Terracotta is precious** — at most one primary accent per view.
5. Maintain the ~70/20/10 neutral : dark : accent ratio.

## Typography

6. **Never invent typography.** Only `Instrument Serif` (display) and `Instrument Sans` (body/UI).
   No third typeface, no decorative/script fonts.
7. Headings are always Serif with tight tracking; body/UI always Sans.
8. Preserve the uppercase, `0.3em`-tracked eyebrow/label style. Don't restyle it per page.

## Spacing & Layout

9. **Never use inconsistent spacing.** Use only the 4px scale (4/8/12/16/24/32/48/64/96/128).
10. Preserve generous whitespace and large section rhythm. "No clutter" — do not crowd.
11. Keep the 1440px container and 12-column discipline; no arbitrary one-off widths.

## Radius

12. **Never mix border-radius systems.** Pills (`full`) for buttons/tags; `md` for UI chrome;
    square corners for editorial imagery. One system, applied consistently.

## Shadows

13. **Never introduce random shadows.** Use only the defined light, warm, diffuse elevation
    tokens. No pure-black or hard drop-shadows. Prefer borders/background shifts.

## Aesthetic & Story

14. **Preserve the premium handmade aesthetic** — calm, tactile, editorial, restrained.
15. **Preserve emotional storytelling** — every surface should feel like "a way of living:
    slower, calmer, more meaningful." Copy stays in the LVY voice: Clarity, Softness, Intention.
16. Use only the Brand Book's signature lines (e.g. "Elevate Your Space", "Crafted for Calm",
    "Made by Hand, Felt by Soul"). Do not fabricate new taglines.
17. Imagery must follow the photography direction: warm natural light, neutral interiors,
    tactile textile/macramé focus. No cool casts, no harsh stock, no trendy 3D/glass effects.

## Logo

18. **Follow logo usage guidelines:** single brand color only, respect clear space and minimum
    size, never stretch/rotate/recolor/add effects, never place on busy/low-contrast areas,
    never recreate the wordmark in another font.

## Consistency & Accessibility

19. **Keep visual consistency** — reuse tokens, components, and patterns; never invent per-page
    styles or one-off components when an existing pattern fits.
20. **Maintain accessibility** — WCAG AA contrast, visible focus rings, 44px targets, semantic
    HTML, alt text, labelled inputs, `prefers-reduced-motion` support. Never trade accessibility
    for aesthetics.

## Engineering Guardrails (scope protection)

21. **Do not change** business logic, API calls, routing, authentication, or state management.
    The redesign touches presentation only.
22. The redesign must feel like **the same website evolved into a premium brand experience** —
    not a different website.
