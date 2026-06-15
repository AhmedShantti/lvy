import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";
import { LvyLogo } from "@/components/brand/LvyLogo";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CategoryGrid({ data: content }: { data?: any }) {
  const eyebrow = content?.eyebrow ?? "Curated collections";
  const title = content?.title ?? "Shop";
  const titleAccent = content?.titleAccent ?? "the collections.";

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
    <section className="section relative overflow-hidden bg-cream">
      <div className="container">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <p className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-terracotta">
              <LvyLogo decorative className="h-3 w-auto text-terracotta" />
              <span aria-hidden className="h-px w-8 bg-terracotta/50" /> {eyebrow}
            </p>
            <h2 className="font-display text-[clamp(2.5rem,5vw,4.25rem)] leading-[0.95] tracking-tightest">
              {title} <em className="font-light italic text-terracotta">{titleAccent}</em>
            </h2>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => scrollBy(-1)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-charcoal/20 transition hover:border-charcoal hover:bg-charcoal hover:text-cream"
              aria-label="Previous collections"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-charcoal/20 transition hover:border-charcoal hover:bg-charcoal hover:text-cream"
              aria-label="Next collections"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Arch lookbook — bleeds off the container edge */}
      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto px-[max(1.25rem,calc((100vw-80rem)/2))] pb-4 scrollbar-hide snap-x snap-mandatory lg:gap-8"
      >
        {categories.map((c, i) => {
          const count = c._count?.products ?? 0;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
              className="w-[74%] flex-shrink-0 snap-start md:w-[44%] lg:w-[27%]"
            >
              <Link to={`/shop?category=${c.slug}`} className="group block">
                {/* Arch image */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-full border border-charcoal/10 bg-sand/50">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] ease-soft group-hover:scale-[1.05]"
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent" />
                  <span aria-hidden className="absolute left-1/2 top-6 -translate-x-1/2 font-display text-sm tabular-nums text-cream/80">
                    N°{String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Plate */}
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl leading-tight lg:text-3xl">{c.name}</h3>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-stone">
                      {count} {count === 1 ? "piece" : "pieces"}
                    </p>
                  </div>
                  <span className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-terracotta transition-all group-hover:gap-2.5">
                    Explore <ArrowUpRight size={13} />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="container mt-10">
        <div className="flex items-center gap-6">
          <div className="relative h-px flex-1 overflow-hidden bg-charcoal/15">
            <motion.div
              className="absolute inset-y-0 left-0 bg-terracotta"
              style={{ width: `${Math.max(18, progress * 100)}%` }}
              transition={{ type: "spring", stiffness: 180, damping: 30 }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone tabular-nums">
            {String(Math.round(progress * (categories.length - 1)) + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
