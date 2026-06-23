import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Star, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { api } from "@/lib/api";
import { LvyLogo } from "@/components/brand/LvyLogo";

const EASE = [0.22, 1, 0.36, 1] as const;

function Eyebrow({ children, tone = "terracotta" }: { children: React.ReactNode; tone?: "terracotta" | "cream" }) {
  const color = tone === "cream" ? "text-cream/70" : "text-terracotta";
  return (
    <p className={`flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] ${color}`}>
      <LvyLogo decorative className={`h-3 w-auto ${tone === "cream" ? "text-cream/70" : "text-terracotta"}`} />
      <span aria-hidden className={`h-px w-8 ${tone === "cream" ? "bg-cream/30" : "bg-terracotta/50"}`} />
      {children}
    </p>
  );
}

export default function FeaturedShowcase({ data: content }: { data?: any }) {
  const eyebrow = content?.eyebrow ?? "The Collection · Curated";
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
    <div className="bg-cream">
      <HeroFeature product={hero} eyebrow={eyebrow} />

      {showcaseItems.map((p: any, i: number) => (
        <EditorialCard key={p.id} product={p} index={i} reverse={i % 2 !== 0} />
      ))}

      {stripItems.length > 0 && (
        <section className="bg-cream py-20 lg:py-28">
          <div className="container mb-10 flex items-end justify-between">
            <Eyebrow>More to discover</Eyebrow>
            <Link
              to="/shop"
              className="link-underline flex items-center gap-2 pb-0.5 text-[11px] uppercase tracking-[0.3em] text-charcoal"
            >
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="container">
            <div className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 scrollbar-hide">
              {stripItems.map((p: any, i: number) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: EASE }}
                  className="w-[72%] flex-shrink-0 snap-start md:w-[36%] lg:w-[23%]"
                >
                  <Link to={`/product/${p.slug}`} className="group block">
                    <div className="mb-4 aspect-[3/4] overflow-hidden rounded-t-[3rem] border border-charcoal/10 bg-sand/50">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 ease-soft group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl leading-tight">{p.name}</h3>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone">{p.material}</p>
                      </div>
                      <p className="font-display text-lg tabular-nums text-terracotta">EGP {Number(p.price).toFixed(0)}</p>
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

/* ─── Hero feature — first piece, cinematic ─── */
function HeroFeature({ product: p, eyebrow }: { product: any; eyebrow: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-charcoal text-cream">
      <div className="grid min-h-[88vh] lg:grid-cols-12">
        {/* Image */}
        <div className="relative overflow-hidden lg:col-span-7">
          <motion.img
            style={{ y: imgY }}
            src={p.images[0]}
            alt={p.name}
            className="absolute inset-0 h-full w-full scale-110 object-cover"
          />
          <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-transparent to-charcoal lg:block" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent lg:hidden" />
          <div aria-hidden className="absolute left-8 top-8 z-10 text-cream/80 mix-blend-difference">
            <p className="font-display text-3xl leading-none tabular-nums">01</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] opacity-70">Featured piece</p>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="px-8 py-16 lg:px-14 lg:py-0 xl:px-16"
          >
            <Eyebrow tone="cream">{eyebrow}</Eyebrow>

            <h2 className="mt-7 font-display text-[clamp(2.5rem,4.5vw,4.25rem)] leading-[0.95] tracking-tightest text-cream">
              {p.name}
            </h2>

            <div className="mt-5 flex items-baseline gap-4">
              <p className="font-display text-3xl tabular-nums text-terracotta">EGP {Number(p.price).toLocaleString()}</p>
              {p.compareAt && Number(p.compareAt) > Number(p.price) && (
                <p className="text-lg tabular-nums text-cream/30 line-through">EGP {Number(p.compareAt).toLocaleString()}</p>
              )}
            </div>

            <div aria-hidden className="my-8 h-px w-12 bg-cream/20" />

            <p className="max-w-md leading-relaxed text-cream/65">{p.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-cream/45">
              <span className="flex items-center gap-1.5" aria-label={`Rated ${Number(p.rating).toFixed(1)} out of 5`}>
                <span className="flex" aria-hidden>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={13} className={n <= Math.round(p.rating) ? "fill-terracotta text-terracotta" : "text-cream/20"} />
                  ))}
                </span>
                <span className="tabular-nums">{Number(p.rating).toFixed(1)}</span>
              </span>
              <span aria-hidden className="h-3 w-px bg-cream/20" />
              <span className="uppercase tracking-[0.2em]">{p.material}</span>
              <span aria-hidden className="h-3 w-px bg-cream/20" />
              <span className="uppercase tracking-[0.2em]">{p.color}</span>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <Link to={`/product/${p.slug}`} className="btn bg-terracotta text-cream hover:bg-terracotta/90 group">
                View piece
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/shop"
                className="link-underline inline-flex items-center gap-2 pb-0.5 text-[11px] uppercase tracking-[0.3em] text-cream/60 hover:text-cream"
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

/* ─── Editorial card — alternating image / text ─── */
function EditorialCard({ product: p, index, reverse }: { product: any; index: number; reverse: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const num = String(index + 2).padStart(2, "0");

  return (
    <section ref={ref} className={`relative ${index % 2 === 0 ? "bg-cream" : "bg-sand/50"}`}>
      <div
        className="grid min-h-[78vh] lg:grid-cols-12"
        style={{ direction: reverse ? "rtl" : "ltr" }}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden lg:col-span-7 lg:aspect-auto" style={{ direction: "ltr" }}>
          <motion.img
            style={{ y: imgY }}
            src={p.images[0]}
            alt={p.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-110 object-cover"
          />
          <div className="absolute left-6 top-6 z-10 flex gap-2">
            {p.isNew && (
              <span className="bg-charcoal px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-cream">New</span>
            )}
            {p.compareAt && Number(p.compareAt) > Number(p.price) && (
              <span className="bg-terracotta px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-cream">Sale</span>
            )}
          </div>
          <div aria-hidden className="absolute bottom-6 right-8 z-10">
            <p className="font-display text-8xl leading-none tabular-nums text-charcoal/[0.07]">{num}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center lg:col-span-5" style={{ direction: "ltr" }}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="px-8 py-14 lg:px-14 lg:py-0 xl:px-16"
          >
            <Eyebrow>{p.category?.name ?? "Macramé"}</Eyebrow>

            <h3 className="mt-6 font-display text-[clamp(2rem,3.5vw,3.25rem)] leading-[0.98] tracking-tightest">
              {p.name}
            </h3>

            <p className="mt-3 font-display text-2xl tabular-nums text-terracotta">EGP {Number(p.price).toLocaleString()}</p>

            <div aria-hidden className="my-6 h-px w-10 bg-charcoal/15" />

            <p className="max-w-md leading-relaxed text-stone">{p.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-stone">
              <span className="flex items-center gap-1.5" aria-label={`Rated ${Number(p.rating).toFixed(1)} out of 5`}>
                <span className="flex" aria-hidden>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={12} className={n <= Math.round(p.rating) ? "fill-terracotta text-terracotta" : "text-charcoal/15"} />
                  ))}
                </span>
                <span className="tabular-nums">{Number(p.rating).toFixed(1)}</span>
              </span>
              <span aria-hidden className="h-3 w-px bg-charcoal/15" />
              <span className="uppercase tracking-[0.2em]">{p.material}</span>
            </div>

            <div className="mt-8">
              <Link to={`/product/${p.slug}`} className="btn btn-primary group">
                View piece
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
