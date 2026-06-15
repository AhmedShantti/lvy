import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { LvyLogo } from "@/components/brand/LvyLogo";

const EASE = [0.22, 1, 0.36, 1] as const;

const DEFAULT_PILLARS = [
  { n: "01", title: "Sourced", body: "Natural cotton, jute, and linen fibres from responsibly managed suppliers." },
  { n: "02", title: "Knotted", body: "Tied by hand in small batches by a studio of skilled macramé artisans." },
  { n: "03", title: "Finished", body: "Undyed, natural fibres and solid wood — never synthetic blends or coatings." },
  { n: "04", title: "Delivered", body: "Made to order and thoughtfully packaged, ready to bring calm to your space." },
];

const DEFAULT_STATS = [
  { value: "2014", label: "Founded" },
  { value: "120+", label: "Artisans" },
  { value: "48", label: "Countries" },
  { value: "50k", label: "Spaces elevated" },
];

export default function Story({ data }: { data?: any }) {
  const eyebrow = data?.eyebrow ?? "Our Philosophy";
  const title = data?.title ?? "Made by hand,";
  const titleAccent = data?.titleAccent ?? "felt by soul.";
  const body =
    data?.body ??
    "Every LVY piece is knotted by hand in small batches using natural fibres and time-honoured macramé techniques. We believe décor should be felt, not just seen — made with care, patience, and intention, to last and to belong.";
  const PILLARS = data?.pillars?.length ? data.pillars : DEFAULT_PILLARS;
  const STATS = data?.stats?.length ? data.stats : DEFAULT_STATS;
  const quote = data?.quote ?? "We don't chase trends. We tie knots that outlast them.";
  const quoteAttribution = data?.quoteAttribution ?? "Founder";
  const ctaPrimary = data?.ctaPrimary ?? { label: "Discover the craft", to: "/about" };
  const ctaSecondary = data?.ctaSecondary ?? { label: "Shop the collection", to: "/shop" };
  const images = data?.images?.length >= 2 ? data.images : [
    "/toa-heftiba-LE3UlRqIFR0-unsplash.jpg",
    "/ceyda-ciftci-JO5Y80Fajjo-unsplash.jpg",
  ];

  return (
    <section className="section relative overflow-hidden bg-cream">
      {/* Official logo watermark */}
      <LvyLogo
        decorative
        className="pointer-events-none absolute -top-10 right-[-4%] w-[34rem] select-none text-charcoal/[0.04] lg:-top-16 lg:w-[46rem]"
      />

      <div className="container relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* ── Image collage ── */}
        <div className="relative h-[72vh] lg:col-span-6 lg:h-[86vh]">
          {/* Terracotta arch block */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE }}
            className="absolute left-0 top-[8%] h-[72%] w-[58%] rounded-t-full bg-terracotta/90"
          />

          {/* Main arch image — top-right */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
            className="absolute right-0 top-0 h-[78%] w-[68%] overflow-hidden rounded-t-full border border-charcoal/10 shadow-md"
          >
            <img src={images[0]} alt="Inside the LVY studio, knotting macramé by hand" className="h-full w-full object-cover" />
            <div aria-hidden className="absolute left-5 top-7 text-cream mix-blend-difference">
              <p className="font-display text-2xl leading-none">N° 001</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.3em] opacity-90">Studio · 2026</p>
            </div>
          </motion.div>

          {/* Secondary framed image — bottom-left */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.22, ease: EASE }}
            className="absolute bottom-0 left-[6%] h-[40%] w-[50%] overflow-hidden border-[10px] border-cream shadow-md"
          >
            <img src={images[1]} alt="Close detail of hand-knotted natural cotton fibres" className="h-full w-full object-cover" />
          </motion.div>

          {/* Floating quote */}
          <motion.figure
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
            className="absolute bottom-10 right-2 hidden max-w-[230px] bg-cream p-6 shadow-md md:block"
          >
            <blockquote className="font-display text-base italic leading-snug text-charcoal/90">"{quote}"</blockquote>
            <figcaption className="mt-3 flex items-center gap-2">
              <span aria-hidden className="h-px w-6 bg-terracotta" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-stone">{quoteAttribution}</span>
            </figcaption>
          </motion.figure>
        </div>

        {/* ── Content ── */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-terracotta">
              <LvyLogo decorative className="h-3 w-auto text-terracotta" />
              <span aria-hidden className="h-px w-8 bg-terracotta/50" /> {eyebrow}
            </p>

            <h2 className="mb-8 font-display text-[clamp(2.5rem,5vw,4.25rem)] leading-[0.95] tracking-tightest">
              {title}
              <br />
              <em className="font-light italic text-terracotta">{titleAccent}</em>
            </h2>

            <p className="mb-10 max-w-lg text-lg leading-relaxed text-stone">{body}</p>
          </motion.div>

          {/* Pillars */}
          <div className="mb-12 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
            {PILLARS.map((p: any, i: number) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: EASE }}
              >
                <div className="mb-3 flex items-baseline gap-3">
                  <span className="font-display text-2xl tabular-nums text-terracotta">{p.n}</span>
                  <span aria-hidden className="mb-2 h-px flex-1 bg-charcoal/15" />
                </div>
                <p className="mb-2 font-display text-xl">{p.title}</p>
                <p className="text-sm leading-relaxed text-stone">{p.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
            className="mb-10 grid grid-cols-4 gap-4 border-y border-charcoal/15 py-8"
          >
            {STATS.map((s: any) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl tabular-nums lg:text-4xl">{s.value}</dd>
                <p aria-hidden className="mt-1 text-[10px] uppercase tracking-[0.25em] text-stone">{s.label}</p>
              </div>
            ))}
          </motion.dl>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            className="flex flex-wrap items-center gap-6"
          >
            <Link to={ctaPrimary.to} className="btn btn-primary group">
              {ctaPrimary.label}
              <ArrowUpRight size={16} className="transition duration-500 group-hover:rotate-45" />
            </Link>
            <Link
              to={ctaSecondary.to}
              className="link-underline inline-flex items-center gap-2 pb-1 text-[11px] uppercase tracking-[0.3em] text-charcoal"
            >
              {ctaSecondary.label} <ArrowUpRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
