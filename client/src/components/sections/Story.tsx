import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const DEFAULT_PILLARS = [
  { n: "01", title: "Sourced", body: "FSC-certified hardwoods and natural fibers from responsibly managed forests." },
  { n: "02", title: "Crafted", body: "Hand-joined in small batches by a studio of master woodworkers." },
  { n: "03", title: "Finished", body: "Natural oils and waxes — never synthetic coatings or stains." },
  { n: "04", title: "Delivered", body: "White-glove placement, packaging removed, assembly included." },
];

const DEFAULT_STATS = [
  { value: "2014", label: "Founded" },
  { value: "120+", label: "Craftsmen" },
  { value: "48", label: "Countries" },
  { value: "50k", label: "Homes furnished" },
];

export default function Story({ data }: { data?: any }) {
  const eyebrow = data?.eyebrow ?? "Our Philosophy";
  const title = data?.title ?? "Built by hand,";
  const titleAccent = data?.titleAccent ?? "designed to last.";
  const body = data?.body ?? "Every LVY piece is made in small batches using sustainably sourced wood, natural fibers, and time-honored joinery. We believe furniture should outlive trends — and become heirlooms you pass down.";
  const PILLARS = data?.pillars?.length ? data.pillars : DEFAULT_PILLARS;
  const STATS = data?.stats?.length ? data.stats : DEFAULT_STATS;
  const quote = data?.quote ?? "We don't chase trends. We build the pieces that outlive them.";
  const quoteAttribution = data?.quoteAttribution ?? "Founder";
  const ctaPrimary = data?.ctaPrimary ?? { label: "Discover the craft", to: "/about" };
  const ctaSecondary = data?.ctaSecondary ?? { label: "Shop the collection", to: "/shop" };
  const images = data?.images?.length >= 2 ? data.images : [
    "/toa-heftiba-LE3UlRqIFR0-unsplash.jpg",
    "/ceyda-ciftci-JO5Y80Fajjo-unsplash.jpg",
  ];
  return (
    <section className="section bg-cream relative overflow-hidden">
      {/* Giant watermark letters behind */}
      <p
        aria-hidden
        className="absolute -top-10 lg:-top-20 right-0 font-display text-[18rem] lg:text-[26rem] leading-none text-charcoal/[0.035] select-none pointer-events-none tracking-tightest"
      >
        lvy
      </p>

      <div className="container relative grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* ═════ Image collage (left) ═════ */}
        <div className="lg:col-span-6 relative h-[75vh] lg:h-[85vh]">
          {/* Terracotta block */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-[8%] w-[60%] h-[72%] bg-terracotta/85"
          />

          {/* Hairline corner ticks at terracotta top-left */}
          <div className="absolute left-0 top-[8%] w-10 h-px bg-charcoal/40" />
          <div className="absolute left-0 top-[8%] h-10 w-px bg-charcoal/40" />

          {/* Main image — top-right, tall portrait */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 w-[70%] h-[78%] overflow-hidden shadow-2xl"
          >
            <img
              src={images[0]}
              alt="Our studio"
              className="w-full h-full object-cover"
            />
            {/* Serial stamp inside image */}
            <div className="absolute top-5 left-5 text-cream mix-blend-difference">
              <p className="font-display text-2xl leading-none">N° 001</p>
              <p className="text-[10px] uppercase tracking-[0.3em] mt-2 opacity-90">Studio · 2026</p>
            </div>
          </motion.div>

          {/* Secondary image — bottom-left, with cream frame */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-[8%] bottom-0 w-[52%] h-[42%] overflow-hidden border-[10px] border-cream shadow-2xl"
          >
            <img
              src={images[1]}
              alt="Craft detail"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Floating quote stamp */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute right-4 bottom-8 bg-cream shadow-2xl p-5 pr-7 max-w-[220px] hidden md:block"
          >
            <p className="font-display italic text-sm leading-snug text-charcoal/90">"{quote}"</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-6 h-px bg-terracotta" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">{quoteAttribution}</p>
            </div>
          </motion.div>
        </div>

        {/* ═════ Content (right) ═════ */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-5 flex items-center gap-3">
              <span className="w-8 h-px bg-terracotta" /> {eyebrow}
            </p>

            <h2 className="font-display text-5xl lg:text-6xl leading-[0.95] tracking-tightest mb-8">
              {title}<br />
              <em className="italic font-light text-terracotta">{titleAccent}</em>
            </h2>

            <p className="text-lg text-muted leading-relaxed mb-10 max-w-lg">{body}</p>
          </motion.div>

          {/* Pillars — numbered grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 mb-12">
            {PILLARS.map((p: any, i: number) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
                className="relative pl-0"
              >
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-display text-2xl tabular-nums text-terracotta">{p.n}</span>
                  <div className="flex-1 h-px bg-charcoal/15 mb-2" />
                </div>
                <p className="font-display text-xl mb-2">{p.title}</p>
                <p className="text-sm text-muted leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-4 gap-4 py-8 border-y border-charcoal/15 mb-10"
          >
            {STATS.map((s: any) => (
              <div key={s.label}>
                <p className="font-display text-3xl lg:text-4xl tabular-nums">{s.value}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link to={ctaPrimary.to} className="btn btn-primary group">
              {ctaPrimary.label}
              <ArrowUpRight size={16} className="group-hover:rotate-45 transition duration-500" />
            </Link>
            <Link
              to={ctaSecondary.to}
              className="text-xs uppercase tracking-[0.3em] border-b border-charcoal pb-1 hover:gap-3 inline-flex items-center gap-2 transition-all"
            >
              {ctaSecondary.label} <ArrowUpRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
