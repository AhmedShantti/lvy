import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import ProductCard from "@/components/ui/ProductCard";
import { LvyLogo } from "@/components/brand/LvyLogo";

const SORTS = [
  { value: "new", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function Shop() {
  const { category: pathCategory } = useParams();
  const [searchParams] = useSearchParams();
  // Accept category from either the path (/shop/:category) or the query (?category=)
  // so every navigation entry point filters consistently.
  const category = pathCategory ?? searchParams.get("category") ?? undefined;
  const [sort, setSort] = useState("new");

  const { data, isLoading } = useQuery({
    queryKey: ["shop", category, sort],
    queryFn: async () =>
      (await api.get("/products", { params: { category, sort, limit: 24 } })).data,
  });

  const { data: catsData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const items: any[] = data?.items ?? [];
  const categories: any[] = catsData?.items ?? [];
  const title = category ? category.replace(/-/g, " ") : "All pieces";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-14 lg:py-20">
      {/* ── Header ── */}
      <header className="border-b border-charcoal/10 pb-8">
        <p className="mb-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-terracotta">
          <LvyLogo decorative className="h-3 w-auto text-terracotta" />
          <span aria-hidden className="h-px w-8 bg-terracotta/50" /> The Collection
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] capitalize leading-[0.95] tracking-tightest">
            {title}
          </h1>
          {!isLoading && (
            <p className="pb-1 text-[11px] uppercase tracking-[0.25em] text-stone tabular-nums">
              {items.length} {items.length === 1 ? "piece" : "pieces"}
            </p>
          )}
        </div>
      </header>

      {/* ── Toolbar: category chips + sort ── */}
      <div className="mb-12 mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {categories.length > 0 && (
          <nav aria-label="Filter by collection" className="-mx-1 flex gap-2 overflow-x-auto px-1 scrollbar-hide">
            <Chip to="/shop" active={!category}>All</Chip>
            {categories.map((c) => (
              <Chip key={c.id} to={`/shop/${c.slug}`} active={category === c.slug}>
                {c.name}
              </Chip>
            ))}
          </nav>
        )}

        <div className="flex flex-shrink-0 items-center gap-3">
          <label htmlFor="shop-sort" className="text-[10px] uppercase tracking-[0.25em] text-stone">
            Sort
          </label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-charcoal/20 bg-paper py-2 pl-4 pr-8 text-sm text-charcoal outline-none transition hover:border-charcoal focus:border-charcoal focus:ring-2 focus:ring-charcoal/10"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} aria-hidden className="animate-pulse">
              <div className="aspect-[3/4] rounded-t-[2rem] bg-sand/50" />
              <div className="mt-4 h-3 w-2/3 bg-sand/50" />
              <div className="mt-2 h-3 w-1/3 bg-sand/40" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <LvyLogo decorative className="mb-6 h-8 w-auto text-charcoal/15" />
          <h2 className="font-display text-3xl tracking-tightest">Nothing here yet.</h2>
          <p className="mt-3 max-w-sm text-stone">
            This collection is still being knotted. Explore the full range of handcrafted pieces.
          </p>
          <Link to="/shop" className="btn btn-primary mt-8">View all pieces</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {items.map((p: any, i: number) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i % 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Chip({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={
        "flex-shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition " +
        (active
          ? "border-charcoal bg-charcoal text-cream"
          : "border-charcoal/20 text-charcoal/70 hover:border-charcoal hover:text-charcoal")
      }
    >
      {children}
    </Link>
  );
}
