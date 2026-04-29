// Default content seed — used if the DB has no rows for a given section type.
// Mirrors the original hardcoded values so the frontend has a fallback.

export const DEFAULT_HOME_SECTIONS = [
  {
    type: "hero",
    order: 0,
    enabled: true,
    data: {
      eyebrow: "Spring Collection · 2026",
      title: "Furniture you can",
      titleAccent: "turn around.",
      body: "Drag, spin, and live with every piece in 3D before it lives with you. Hand-crafted in our studio — delivered with care.",
      ctaPrimary: { label: "Shop Collection", to: "/shop" },
      ctaSecondary: { label: "Our Story", to: "/about" },
      images: [
        "/toa-heftiba-LE3UlRqIFR0-unsplash.jpg",
        "/ceyda-ciftci-JO5Y80Fajjo-unsplash.jpg",
        "/toa-heftiba-GyG8thVBInw-unsplash.jpg",
        "/dmitry-mashkin-QAmRmIvSZZM-unsplash.jpg",
      ],
    },
  },
  {
    type: "scrollScene",
    order: 1,
    enabled: true,
    data: {
      title: "The Sheen Lounge",
      eyebrow: "Featured Piece",
      panels: [
        { eyebrow: "Material", title: "Sheen wool, hand-tufted.", body: "Each piece is upholstered in a tightly woven wool sheen — finished by hand and treated with a natural water repellent." },
        { eyebrow: "Craft", title: "Joinery you can feel.", body: "Solid oak frame, mortise-and-tenon joints, and a webbed suspension that lasts two decades — not two seasons." },
        { eyebrow: "Delivery", title: "White glove, every time.", body: "We bring it inside, place it where you want, and remove the packaging. Available in 30+ cities." },
      ],
    },
  },
  {
    type: "featured",
    order: 2,
    enabled: true,
    data: {
      eyebrow: "New in · Curated",
      title: "Featured",
      titleAccent: "pieces.",
      limit: 8,
    },
  },
  {
    type: "categoryGrid",
    order: 3,
    enabled: true,
    data: {
      eyebrow: "Curated spaces",
      title: "Shop",
      titleAccent: "by room.",
    },
  },
  {
    type: "story",
    order: 4,
    enabled: true,
    data: {
      eyebrow: "Our Philosophy",
      title: "Built by hand,",
      titleAccent: "designed to last.",
      body: "Every LVY piece is made in small batches using sustainably sourced wood, natural fibers, and time-honored joinery. We believe furniture should outlive trends — and become heirlooms you pass down.",
      pillars: [
        { n: "01", title: "Sourced", body: "FSC-certified hardwoods and natural fibers from responsibly managed forests." },
        { n: "02", title: "Crafted", body: "Hand-joined in small batches by a studio of master woodworkers." },
        { n: "03", title: "Finished", body: "Natural oils and waxes — never synthetic coatings or stains." },
        { n: "04", title: "Delivered", body: "White-glove placement, packaging removed, assembly included." },
      ],
      stats: [
        { value: "2014", label: "Founded" },
        { value: "120+", label: "Craftsmen" },
        { value: "48", label: "Countries" },
        { value: "50k", label: "Homes furnished" },
      ],
      quote: "We don't chase trends. We build the pieces that outlive them.",
      quoteAttribution: "Founder",
      ctaPrimary: { label: "Discover the craft", to: "/about" },
      ctaSecondary: { label: "Shop the collection", to: "/shop" },
      images: [
        "/toa-heftiba-LE3UlRqIFR0-unsplash.jpg",
        "/ceyda-ciftci-JO5Y80Fajjo-unsplash.jpg",
      ],
    },
  },
];

export const DEFAULT_SETTINGS = {
  storeName: "LVY",
  supportEmail: "support@lvy.shop",
  currency: "USD",
  taxRate: 0.08,
  freeShippingThreshold: 1500,
  standardShipping: 25,
  expressShipping: 60,
  whiteGloveShipping: 199,
  socials: { instagram: "", twitter: "", pinterest: "" },
};
