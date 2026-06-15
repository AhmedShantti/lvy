import { motion } from "framer-motion";
import { LvyLogo } from "@/components/brand/LvyLogo";

const EASE = [0.22, 1, 0.36, 1] as const;

const DEFAULT_QUOTES = [
  { q: "It brings a quiet warmth to the room — the first thing guests notice, and the last thing I'd part with.", a: "Hannah", loc: "Brooklyn" },
  { q: "You can feel the hours in every knot. It's the most calming piece in our home.", a: "Marcus", loc: "Lisbon" },
  { q: "Beautifully made and beautifully packaged. It already feels like an heirloom.", a: "Sofia", loc: "Copenhagen" },
];

export default function Testimonials({ data }: { data?: any }) {
  const eyebrow = data?.eyebrow ?? "Lived with, loved daily";
  const title = data?.title ?? "Quietly crafted, deeply felt.";
  const quotes = data?.quotes?.length ? data.quotes : DEFAULT_QUOTES;

  return (
    <section className="section bg-charcoal text-cream">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-6 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.3em] text-cream/60">
            <LvyLogo decorative className="h-3 w-auto text-cream/60" />
            <span aria-hidden className="h-px w-8 bg-cream/25" /> {eyebrow}
          </p>
          <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.02] tracking-tightest">
            {title}
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden border border-cream/10 bg-cream/10 md:grid-cols-3">
          {quotes.map((t: any, i: number) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
              className="flex flex-col bg-charcoal p-10 lg:p-12"
            >
              <span aria-hidden className="font-display text-5xl leading-none text-terracotta">&ldquo;</span>
              <blockquote className="mt-4 flex-1 font-display text-xl italic leading-relaxed text-cream/90">
                {t.q}
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span aria-hidden className="h-px w-6 bg-terracotta" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-cream/60">
                  {t.a}{t.loc ? ` · ${t.loc}` : ""}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
