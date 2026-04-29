import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";

export default function CategoryGrid({ data: content }: { data?: any }) {
  const eyebrow = content?.eyebrow ?? "Curated spaces";
  const title = content?.title ?? "Shop";
  const titleAccent = content?.titleAccent ?? "by room.";

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const categories: any[] = data?.items ?? [];

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [categories.length]);

  const scrollBy = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <section className="section bg-sand/40 relative overflow-hidden">
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

          {/* Nav arrows */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scrollBy(-1)}
              className="w-12 h-12 rounded-full border border-charcoal/25 hover:bg-charcoal hover:text-cream hover:border-charcoal transition flex items-center justify-center"
              aria-label="Previous"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="w-12 h-12 rounded-full border border-charcoal/25 hover:bg-charcoal hover:text-cream hover:border-charcoal transition flex items-center justify-center"
              aria-label="Next"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal lookbook — bleeds off the container edge */}
      <div
        ref={scrollerRef}
        className="flex gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 px-[max(1rem,calc((100vw-80rem)/2))] scrollbar-hide"
      >
        {categories.map((c, i) => {
          const count = c._count?.products ?? 0;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex-shrink-0 w-[78%] md:w-[44%] lg:w-[28%] snap-start"
            >
              <Link to={`/shop?category=${c.slug}`} className="block group relative">
                {/* Number */}
                <div className="flex items-center justify-between mb-4">
                  <p className="font-display text-2xl tabular-nums text-charcoal/30">
                    N°{String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
                    {count} {count === 1 ? "piece" : "pieces"}
                  </p>
                </div>

                {/* Image card */}
                <div className="relative aspect-[3/4] overflow-hidden bg-charcoal/10">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-[900ms] ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

                  {/* Title block at bottom */}
                  <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
                    <h3 className="font-display text-3xl lg:text-4xl leading-tight">{c.name}</h3>
                    <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] opacity-90 group-hover:gap-3 transition-all">
                      Explore <ArrowUpRight size={12} />
                    </div>
                  </div>

                  {/* Hover accent border */}
                  <div className="absolute inset-0 border-0 group-hover:border-[12px] border-cream/20 transition-all duration-500" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Scroll progress bar */}
      <div className="container mt-10">
        <div className="flex items-center gap-6">
          <div className="flex-1 h-px bg-charcoal/15 relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-charcoal"
              style={{ width: `${Math.max(20, progress * 100)}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 30 }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted tabular-nums">
            {String(Math.round(progress * (categories.length - 1)) + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
