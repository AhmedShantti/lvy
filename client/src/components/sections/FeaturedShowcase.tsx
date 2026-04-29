import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Star, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { api } from "@/lib/api";

export default function FeaturedShowcase({ data: content }: { data?: any }) {
  const eyebrow = content?.eyebrow ?? "New in · Curated";
  const limit = content?.limit ?? 8;

  const { data } = useQuery({
    queryKey: ["featured", limit],
    queryFn: async () => (await api.get("/products", { params: { featured: true, limit } })).data,
  });

  const items: any[] = data?.items ?? [];
  if (items.length === 0) return null;

  const hero = items[0];
  const showcaseItems = items.slice(1, 5);
  const stripItems = items.slice(5);

  return (
    <div>
      {/* ═════ Hero feature — full bleed ═════ */}
      <HeroFeature product={hero} eyebrow={eyebrow} />

      {/* ═════ Alternating editorial cards ═════ */}
      {showcaseItems.map((p: any, i: number) => (
        <EditorialCard key={p.id} product={p} index={i} reverse={i % 2 !== 0} />
      ))}

      {/* ═════ Scroll strip ═════ */}
      {stripItems.length > 0 && (
        <section className="bg-cream py-16 lg:py-24">
          <div className="container mb-8 flex items-end justify-between">
            <p className="text-xs uppercase tracking-[0.4em] text-muted">More to discover</p>
            <Link
              to="/shop"
              className="text-xs uppercase tracking-[0.3em] border-b border-charcoal pb-0.5 flex items-center gap-2 hover:gap-3 transition-all"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="container">
            <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
              {stripItems.map((p: any, i: number) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="flex-shrink-0 w-[70%] md:w-[35%] lg:w-[23%] snap-start"
                >
                  <Link to={`/product/${p.slug}`} className="block group">
                    <div className="aspect-[3/4] overflow-hidden bg-sand/40 mb-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-display text-lg">{p.name}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted mt-1">{p.material}</p>
                      </div>
                      <p className="font-display text-lg tabular-nums">${Number(p.price).toFixed(0)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Hero feature — the first piece, full-bleed immersive
   ═══════════════════════════════════════════════════════ */
function HeroFeature({ product: p, eyebrow }: { product: any; eyebrow: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="relative bg-charcoal overflow-hidden">
      <div className="grid lg:grid-cols-12 min-h-[90vh]">
        {/* Image — 7 columns, parallax */}
        <div className="lg:col-span-7 relative overflow-hidden">
          <motion.img
            style={{ y: imgY }}
            src={p.images[0]}
            alt={p.name}
            className="absolute inset-0 w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-charcoal/90 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent lg:hidden" />

          {/* Serial stamp */}
          <div className="absolute top-8 left-8 text-cream/80 mix-blend-difference z-10">
            <p className="font-display text-3xl tabular-nums leading-none">01</p>
            <p className="text-[10px] uppercase tracking-[0.3em] mt-2 opacity-70">Featured</p>
          </div>
        </div>

        {/* Content — 5 columns */}
        <div className="lg:col-span-5 flex items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="px-8 lg:px-12 xl:px-16 py-16 lg:py-0"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-terracotta" /> {eyebrow}
            </p>

            <h2 className="font-display text-5xl lg:text-6xl xl:text-7xl text-cream leading-[0.92] tracking-tightest">
              {p.name}
            </h2>

            <div className="flex items-baseline gap-4 mt-6">
              <p className="font-display text-3xl text-terracotta tabular-nums">
                ${Number(p.price).toLocaleString()}
              </p>
              {p.compareAt && Number(p.compareAt) > Number(p.price) && (
                <p className="text-lg text-cream/30 line-through tabular-nums">
                  ${Number(p.compareAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="w-12 h-px bg-cream/15 my-8" />

            <p className="text-cream/60 leading-relaxed max-w-md">
              {p.description}
            </p>

            <div className="flex items-center gap-4 mt-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={14} className={n <= Math.round(p.rating) ? "fill-terracotta text-terracotta" : "text-cream/15"} />
                ))}
              </div>
              <span className="text-xs text-cream/40 tabular-nums">{Number(p.rating).toFixed(1)}</span>
              <span className="w-px h-3 bg-cream/15" />
              <span className="text-xs text-cream/40 uppercase tracking-wider">{p.material}</span>
              <span className="w-px h-3 bg-cream/15" />
              <span className="text-xs text-cream/40 uppercase tracking-wider">{p.color}</span>
            </div>

            <div className="flex items-center gap-4 mt-10">
              <Link
                to={`/product/${p.slug}`}
                className="btn btn-primary bg-terracotta hover:bg-terracotta/90 group"
              >
                View piece
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop"
                className="text-xs uppercase tracking-[0.3em] text-cream/50 border-b border-cream/20 pb-0.5 hover:text-cream hover:gap-3 inline-flex items-center gap-2 transition-all"
              >
                Shop all <ArrowUpRight size={12} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   Editorial card — alternating image/text
   ═══════════════════════════════════════════════════════ */
function EditorialCard({ product: p, index, reverse }: { product: any; index: number; reverse: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const num = String(index + 2).padStart(2, "0");

  return (
    <section
      ref={ref}
      className={`relative ${index % 2 === 0 ? "bg-cream" : "bg-sand/40"}`}
    >
      <div className={`grid lg:grid-cols-12 min-h-[75vh] ${reverse ? "direction-rtl" : ""}`}
        style={{ direction: reverse ? "rtl" : "ltr" }}
      >
        {/* Image — 7 columns */}
        <div className="lg:col-span-7 relative overflow-hidden aspect-[4/3] lg:aspect-auto" style={{ direction: "ltr" }}>
          <motion.img
            style={{ y: imgY }}
            src={p.images[0]}
            alt={p.name}
            className="absolute inset-0 w-full h-full object-cover scale-110"
          />

          {/* Badges */}
          <div className="absolute top-6 left-6 z-10 flex gap-2">
            {p.isNew && (
              <span className="text-[10px] uppercase tracking-[0.2em] bg-charcoal text-cream px-3 py-1.5">
                New
              </span>
            )}
            {p.compareAt && Number(p.compareAt) > Number(p.price) && (
              <span className="text-[10px] uppercase tracking-[0.2em] bg-terracotta text-cream px-3 py-1.5">
                Sale
              </span>
            )}
          </div>

          {/* Number watermark */}
          <div className="absolute bottom-6 right-8 z-10">
            <p className="font-display text-8xl text-charcoal/[0.08] leading-none tabular-nums">{num}</p>
          </div>
        </div>

        {/* Content — 5 columns */}
        <div className="lg:col-span-5 flex items-center" style={{ direction: "ltr" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="px-8 lg:px-12 xl:px-16 py-14 lg:py-0"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-4 flex items-center gap-3">
              <span className="w-8 h-px bg-terracotta" /> {p.category?.name ?? "Piece"}
            </p>

            <h3 className="font-display text-4xl lg:text-5xl leading-[0.95] tracking-tightest">
              {p.name}
            </h3>

            <p className="font-display text-2xl text-terracotta mt-3 tabular-nums">
              ${Number(p.price).toLocaleString()}
            </p>

            <div className="w-10 h-px bg-charcoal/15 my-6" />

            <p className="text-muted leading-relaxed max-w-md">
              {p.description}
            </p>

            <div className="flex items-center gap-3 mt-5 text-xs text-muted">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={12} className={n <= Math.round(p.rating) ? "fill-terracotta text-terracotta" : "text-charcoal/15"} />
                ))}
              </div>
              <span className="tabular-nums">{Number(p.rating).toFixed(1)}</span>
              <span className="w-px h-3 bg-charcoal/15" />
              <span className="uppercase tracking-wider">{p.material}</span>
              <span className="w-px h-3 bg-charcoal/15" />
              <span className="uppercase tracking-wider">{p.color}</span>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <Link
                to={`/product/${p.slug}`}
                className="btn btn-primary group"
              >
                View piece
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
