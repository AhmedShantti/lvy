import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function Shop() {
  const { category } = useParams();
  const [sort, setSort] = useState("new");
  const { data, isLoading } = useQuery({
    queryKey: ["shop", category, sort],
    queryFn: async () =>
      (await api.get("/products", { params: { category, sort, limit: 24 } })).data,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-16">
      <div className="flex items-end justify-between mb-12 border-b border-charcoal/10 pb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-2">Collection</p>
          <h1 className="text-5xl md:text-6xl capitalize">{category?.replace("-", " ") ?? "All Furniture"}</h1>
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent border-b border-charcoal/30 py-2 text-sm outline-none">
          <option value="new">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-sand/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
          {data?.items?.map((p: any, i: number) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 8) * 0.05 }}
            >
              <Link to={`/product/${p.slug}`} className="product-card block aspect-[3/4] mb-4 bg-sand/30">
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                {p.isNew && <span className="absolute top-4 left-4 bg-cream px-3 py-1 text-xs uppercase tracking-wider">New</span>}
              </Link>
              <h3 className="text-base font-medium">{p.name}</h3>
              <p className="text-sm text-muted">${Number(p.price).toFixed(0)}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
