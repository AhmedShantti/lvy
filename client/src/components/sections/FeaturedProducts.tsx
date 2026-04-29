import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";

function PriceTag({ price, compareAt }: { price: number; compareAt?: number | null }) {
  const onSale = compareAt && compareAt > price;
  return (
    <div className="flex items-baseline gap-2">
      <p className="font-display text-lg tabular-nums">${Number(price).toFixed(0)}</p>
      {onSale && <p className="text-xs text-muted line-through tabular-nums">${Number(compareAt).toFixed(0)}</p>}
    </div>
  );
}

function FeaturedCard({ p, size = "md" }: { p: any; size?: "xl" | "md" | "sm" }) {
  const aspect = size === "xl" ? "aspect-[4/5]" : size === "md" ? "aspect-square" : "aspect-[4/5]";
  const titleClass = size === "xl" ? "font-display text-3xl lg:text-4xl" : "font-display text-lg";

  return (
    <Link to={`/product/${p.slug}`} className="block group relative h-full">
      <div className={`relative ${aspect} overflow-hidden bg-sand/40`}>
        <img
          src={p.images[0]}
          alt={p.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition duration-700 ease-out"
        />
        {/* Bottom gradient for label legibility */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {p.isNew && (
            <span className="text-[10px] uppercase tracking-[0.2em] bg-cream text-charcoal px-3 py-1 shadow">
              New
            </span>
          )}
          {p.compareAt && p.compareAt > p.price && (
            <span className="text-[10px] uppercase tracking-[0.2em] bg-terracotta text-cream px-3 py-1 shadow">
              Sale
            </span>
          )}
        </div>

        {/* Hover CTA circle */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-cream/90 backdrop-blur flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-500">
          <ArrowUpRight size={16} />
        </div>

        {/* Label inside image at bottom */}
        <div className="absolute bottom-5 left-5 right-5 text-cream">
          <p className="text-[10px] uppercase tracking-[0.3em] text-cream/70 mb-1">{p.material}</p>
          <div className="flex items-end justify-between gap-4">
            <h3 className={`${titleClass} leading-tight`}>{p.name}</h3>
            <div className="flex items-baseline gap-2 flex-shrink-0">
              <p className="font-display text-lg tabular-nums">${Number(p.price).toFixed(0)}</p>
              {p.compareAt && p.compareAt > p.price && (
                <p className="text-xs text-cream/60 line-through tabular-nums">${Number(p.compareAt).toFixed(0)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProducts({ data: content }: { data?: any }) {
  const eyebrow = content?.eyebrow ?? "New in · Curated";
  const title = content?.title ?? "Featured";
  const titleAccent = content?.titleAccent ?? "pieces.";
  const limit = content?.limit ?? 8;

  const { data } = useQuery({
    queryKey: ["featured", limit],
    queryFn: async () => (await api.get("/products", { params: { featured: true, limit } })).data,
  });

  const items: any[] = data?.items ?? [];
  if (items.length === 0) return null;

  const hero = items[0];
  const topRight = items.slice(1, 5);
  const strip = items.slice(5);

  return (
    <section className="section bg-cream">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-4 flex items-center gap-3">
              <span className="w-8 h-px bg-terracotta" /> {eyebrow}
            </p>
            <h2 className="font-display text-5xl lg:text-6xl leading-[0.95] tracking-tightest">
              {title}<br />
              <em className="italic font-light text-terracotta">{titleAccent}</em>
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] border-b border-charcoal pb-1 hover:gap-3 transition-all"
          >
            Shop the collection <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Editorial bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Hero — full height, spans 2 rows */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 lg:row-span-2"
          >
            <FeaturedCard p={hero} size="xl" />
          </motion.div>

          {/* 4 smaller tiles on the right */}
          {topRight.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-3"
            >
              <FeaturedCard p={p} size="md" />
            </motion.div>
          ))}
        </div>

        {/* Carousel strip for remaining items */}
        {strip.length > 0 && (
          <div className="mt-6 lg:mt-8">
            <div className="flex gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
              {strip.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="flex-shrink-0 w-[70%] md:w-[35%] lg:w-[23%] snap-start"
                >
                  <FeaturedCard p={p} size="sm" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile "shop all" */}
        <div className="mt-10 md:hidden text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] border-b border-charcoal pb-1"
          >
            Shop the collection <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
