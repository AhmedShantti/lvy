import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Truck, RotateCcw, Move3d, Image as ImageIcon,
  Minus, Plus, Star, Check, ChevronRight, X, Share2, Ruler, Leaf,
} from "lucide-react";
import { api } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import Product3D from "@/components/three/Product3D";
import ReviewForm from "@/components/ui/ReviewForm";
import ProductCard from "@/components/ui/ProductCard";
import { LvyLogo } from "@/components/brand/LvyLogo";

/** Brand eyebrow — consistent with the Home design system. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-terracotta">
      <LvyLogo decorative className="h-3 w-auto text-terracotta" />
      <span aria-hidden className="h-px w-8 bg-terracotta/50" />
      {children}
    </p>
  );
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? "fill-terracotta text-terracotta" : "text-charcoal/20"}
        />
      ))}
    </div>
  );
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "specs", label: "Specifications" },
  { id: "shipping", label: "Shipping & Returns" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function ProductDetail() {
  const { slug } = useParams();
  const [active, setActive] = useState(0);
  const [view, setView] = useState<"image" | "3d">("image");
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [showForm, setShowForm] = useState(false);
  const add = useCart((s) => s.add);
  const wish = useWishlist();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await api.get(`/products/${slug}`)).data,
    enabled: !!slug,
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setActive(0);
    setQty(1);
    setVariantId(null);
    setView("image");
    setTab("overview");
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[4/5] bg-sand/40 animate-pulse" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-3 w-24 bg-sand/60 animate-pulse" />
            <div className="h-14 w-5/6 bg-sand/60 animate-pulse" />
            <div className="h-6 w-32 bg-sand/60 animate-pulse" />
            <div className="h-32 bg-sand/40 animate-pulse" />
            <div className="h-14 bg-sand/60 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.product) {
    return (
      <div className="container py-32 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-muted mb-6">404</p>
        <h1 className="font-display text-5xl mb-4">Piece not found</h1>
        <p className="text-muted mb-8 max-w-md mx-auto">
          The piece you're looking for may have moved or sold out. Explore the rest of the collection.
        </p>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const p = data.product;
  const reviews: any[] = p.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : Number(p.rating ?? 0);
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const maxDist = Math.max(1, ...distribution.map((d) => d.count));
  const discount = p.compareAt ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100) : 0;
  const onSale = discount > 0;
  const stockLevel = p.stock ?? 0;
  const lowStock = stockLevel > 0 && stockLevel <= 5;
  const outOfStock = stockLevel === 0;
  const inWishlist = wish.has(p.id);
  const totalImages = p.images.length;
  const sku = p.slug.toUpperCase();

  const handleAdd = () => {
    if (outOfStock) return;
    add({
      productId: p.id,
      name: p.name,
      image: p.images[0],
      price: Number(p.price),
      quantity: qty,
      variant: variantId ?? undefined,
    });
    setToast(`${p.name} × ${qty} added to bag`);
  };

  const handleWishlist = () => {
    wish.toggle(p.id);
    setToast(inWishlist ? "Removed from wishlist" : "Saved to wishlist");
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: p.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setToast("Link copied");
      }
    } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative pb-24 lg:pb-12">
      {/* ═════ Top meta row ═════ */}
      <div className="container pt-8 pb-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted">
        <nav className="flex items-center gap-2">
          <Link to="/" className="hover:text-charcoal transition">Home</Link>
          <ChevronRight size={11} />
          <Link to="/shop" className="hover:text-charcoal transition">Shop</Link>
          <ChevronRight size={11} />
          <Link to={`/shop?category=${p.category.slug}`} className="hover:text-charcoal transition">
            {p.category.name}
          </Link>
        </nav>
        <div className="hidden md:flex items-center gap-6">
          <span className="tabular-nums">N° {sku}</span>
          <button onClick={handleShare} className="flex items-center gap-2 hover:text-charcoal transition">
            <Share2 size={12} /> Share
          </button>
        </div>
      </div>

      {/* ═════ HERO: asymmetric gallery + sticky buy box ═════ */}
      <div className="container grid lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Gallery — 7/12 */}
        <div className="lg:col-span-7 relative">
          {/* Terracotta accent block behind image (subtle arch motif) */}
          <div aria-hidden className="absolute -left-4 lg:-left-10 bottom-8 w-[55%] h-[65%] rounded-t-full bg-terracotta/85 hidden lg:block" />

          {/* Vertical thumbnail rail (desktop) */}
          <div className="hidden lg:flex absolute -left-4 top-8 flex-col gap-3 z-20">
            {p.images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => { setActive(i); setView("image"); }}
                className={`relative w-16 h-20 overflow-hidden transition-all ${
                  active === i && view === "image"
                    ? "ring-2 ring-charcoal scale-105 shadow-lg"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main image card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] lg:ml-16 bg-gradient-to-br from-sand/40 to-sand/10 overflow-hidden rounded-t-[2.5rem] border border-charcoal/10 shadow-md"
          >
            {/* Serial counter top-left */}
            <div className="absolute top-6 left-6 z-20 text-cream pointer-events-none mix-blend-difference">
              <p className="font-display text-3xl leading-none tabular-nums">
                {String(active + 1).padStart(2, "0")}
                <span className="text-xl opacity-60"> / {String(totalImages).padStart(2, "0")}</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-80 mt-2">{p.category.name}</p>
            </div>

            {/* Badges top-right */}
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 items-end">
              {p.isNew && (
                <span className="text-[10px] uppercase tracking-[0.2em] bg-charcoal text-cream px-3 py-1.5 shadow-lg">
                  New Arrival
                </span>
              )}
              {onSale && (
                <span className="text-[10px] uppercase tracking-[0.2em] bg-terracotta text-cream px-3 py-1.5 shadow-lg">
                  −{discount}% Off
                </span>
              )}
            </div>

            {/* 3D/Photo toggle bottom-right */}
            {p.model3dUrl && (
              <div className="absolute bottom-6 right-6 z-20 flex gap-1 bg-cream/95 backdrop-blur-md rounded-full p-1 shadow-xl">
                <button
                  onClick={() => setView("image")}
                  className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition ${view === "image" ? "bg-charcoal text-cream" : "text-charcoal/60 hover:text-charcoal"}`}
                >
                  <ImageIcon size={11} /> Photo
                </button>
                <button
                  onClick={() => setView("3d")}
                  className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition ${view === "3d" ? "bg-charcoal text-cream" : "text-charcoal/60 hover:text-charcoal"}`}
                >
                  <Move3d size={11} /> 3D View
                </button>
              </div>
            )}

            {/* Image / 3D */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${view}-${active}`}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {view === "image" ? (
                  <button
                    onClick={() => setLightbox(true)}
                    className="w-full h-full cursor-zoom-in group/img"
                    aria-label="Zoom image"
                  >
                    <img
                      src={p.images[active]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover/img:scale-[1.02] transition duration-700"
                    />
                  </button>
                ) : (
                  <Product3D url={p.model3dUrl ?? undefined} scale={6} fallbackImage={p.images[0]} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Mobile thumbnail strip */}
          <div className="flex lg:hidden gap-2 mt-3 overflow-x-auto pb-2">
            {p.images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => { setActive(i); setView("image"); }}
                className={`flex-shrink-0 w-16 h-20 overflow-hidden ${active === i && view === "image" ? "ring-2 ring-charcoal" : "opacity-60"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Buy box — 5/12, sticky */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start"
        >
          <Eyebrow>{p.category.name}</Eyebrow>

          <h1 className="font-display text-[clamp(2.5rem,4.5vw,3.75rem)] leading-[0.95] tracking-tightest mb-5">
            {p.name}
          </h1>

          {(reviews.length > 0 || avgRating > 0) && (
            <button
              onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-3 mb-6 hover:opacity-70 transition"
            >
              <Stars value={avgRating} />
              <span className="text-sm text-muted">
                {avgRating.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </span>
            </button>
          )}

          <div className="flex items-baseline gap-3 mb-2">
            <p className="font-display text-4xl tabular-nums">${Number(p.price).toLocaleString()}</p>
            {onSale && (
              <p className="text-xl text-muted line-through tabular-nums">
                ${Number(p.compareAt).toLocaleString()}
              </p>
            )}
          </div>
          <p className="text-xs text-muted mb-8">
            Taxes included. <Link to="/shipping" className="underline underline-offset-2">Shipping</Link> calculated at checkout.
          </p>

          <div className="w-12 h-px bg-charcoal/20 mb-8" />

          <p className="text-muted leading-relaxed mb-8">{p.description}</p>

          {/* Variants */}
          {p.variants?.length > 0 && (
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-muted mb-3">
                Option · <span className="text-charcoal">{p.variants.find((v: any) => v.id === variantId)?.name ?? "Select"}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {p.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    className={`px-5 py-2.5 text-sm border transition ${
                      variantId === v.id
                        ? "border-charcoal bg-charcoal text-cream"
                        : "border-charcoal/20 hover:border-charcoal"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock pill */}
          <div className="mb-6">
            {outOfStock ? (
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-terracotta">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" /> Out of stock
              </span>
            ) : lowStock ? (
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-terracotta">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                Only {stockLevel} left — order soon
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sage">
                <span className="w-1.5 h-1.5 rounded-full bg-sage" /> In stock · Ready to ship
              </span>
            )}
          </div>

          {/* Qty + CTA row */}
          <div className="flex gap-3 mb-4">
            <div className="flex items-center border border-charcoal/25">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3.5 py-4 hover:bg-sand/40 transition disabled:opacity-40"
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="px-4 min-w-[2.5rem] text-center tabular-nums font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(stockLevel || 99, q + 1))}
                className="px-3.5 py-4 hover:bg-sand/40 transition disabled:opacity-40"
                disabled={stockLevel > 0 && qty >= stockLevel}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className="btn btn-terracotta flex-1 text-sm uppercase tracking-[0.15em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {outOfStock ? "Sold Out" : `Add to Bag — $${Number(p.price).toLocaleString()}`}
            </button>
            <button
              onClick={handleWishlist}
              className={`btn btn-outline transition ${inWishlist ? "bg-terracotta/10 border-terracotta" : ""}`}
              aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={inWishlist}
            >
              <Heart size={18} className={inWishlist ? "fill-terracotta text-terracotta" : ""} />
            </button>
          </div>

          {/* Trust icons */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-charcoal/10 pt-6 text-xs">
            <div className="flex flex-col items-center gap-2 text-center">
              <Leaf size={20} className="text-terracotta/80" /><span className="text-muted">Hand-knotted<br />with care</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Truck size={20} className="text-terracotta/80" /><span className="text-muted">Carbon-neutral<br />shipping</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <RotateCcw size={20} className="text-terracotta/80" /><span className="text-muted">30-day<br />returns</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═════ Editorial break — "Crafted with intent" ═════ */}
      <section className="container mt-32 lg:mt-40 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <Eyebrow>Craftsmanship</Eyebrow>
          <h2 className="font-display text-4xl lg:text-5xl leading-[1.05] mb-6">
            Made by hand,<br />
            <em className="italic font-light text-terracotta">felt by soul.</em>
          </h2>
          <p className="text-stone leading-relaxed mb-8">
            Every {p.name.toLowerCase()} is knotted by hand in our studio from {p.material.toLowerCase()},
            using time-honoured macramé techniques — softness and balance brought into the room,
            one intentional knot at a time. Made to last, and made to belong.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Leaf size={18} className="text-terracotta mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Natural fibres</p>
                <p className="text-sm text-stone">Undyed {p.material.toLowerCase()} — never synthetic blends or coatings.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Ruler size={18} className="text-terracotta mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Hand-knotted</p>
                <p className="text-sm text-stone">Tied slowly and deliberately, in small batches, by skilled artisans.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 relative h-[60vh]">
          <div className="absolute right-0 top-0 w-[85%] h-full overflow-hidden rounded-t-[2.5rem]">
            <img src={p.images[Math.min(1, totalImages - 1)]} alt={`${p.name} detail`} className="w-full h-full object-cover" />
          </div>
          <div className="absolute left-0 bottom-0 w-[45%] h-[55%] overflow-hidden border-8 border-cream shadow-md">
            <img src={p.images[Math.min(2, totalImages - 1)]} alt={`${p.name} in context`} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ═════ Tabs: Overview / Specs / Shipping ═════ */}
      <section className="container mt-32">
        <div className="flex items-center gap-0 border-b border-charcoal/15 mb-10">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-0 py-5 mr-10 text-xs uppercase tracking-[0.3em] transition ${
                tab === t.id ? "text-charcoal" : "text-muted hover:text-charcoal"
              }`}
            >
              {t.label}
              {tab === t.id && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-charcoal"
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="max-w-3xl"
          >
            {tab === "overview" && (
              <div className="space-y-4 text-muted leading-relaxed">
                <p>{p.description}</p>
                <p>
                  Designed in our studio and made to belong, this piece blends timeless silhouettes
                  with quiet, tactile warmth. Each detail — from the tension of every knot to the
                  natural finish of the fibres — is considered for how you actually live with it.
                </p>
              </div>
            )}

            {tab === "specs" && (
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
                {[
                  ["Material", p.material],
                  ["Color", p.color],
                  ["Dimensions", p.dimensions],
                  ["SKU", sku],
                  ["Category", p.category.name],
                  ["Stock", outOfStock ? "Sold out" : `${stockLevel} available`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-charcoal/10 py-3">
                    <span className="text-muted uppercase tracking-wider text-xs">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "shipping" && (
              <div className="space-y-6 text-muted leading-relaxed">
                <div>
                  <p className="font-medium text-charcoal mb-2">Thoughtfully packaged</p>
                  <p>Each piece is wrapped with care and shipped carbon-neutral, ready to bring calm into your space.</p>
                </div>
                <div>
                  <p className="font-medium text-charcoal mb-2">Made with intention</p>
                  <p>Knotted by hand in small batches from natural fibres — so every piece arrives a little different, and entirely its own.</p>
                </div>
                <div>
                  <p className="font-medium text-charcoal mb-2">30-day returns</p>
                  <p>Not the right fit? Return it within 30 days for a full refund.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ═════ Reviews ═════ */}
      <section id="reviews" className="container mt-32">
        <div className="flex items-end justify-between border-b border-charcoal/15 pb-8 mb-12">
          <div>
            <Eyebrow>What people say</Eyebrow>
            <h2 className="font-display text-4xl lg:text-5xl tracking-tightest">Reviews</h2>
          </div>
          <button onClick={() => setShowForm((s) => !s)} className="btn btn-outline hidden md:block">
            {showForm ? "Close form" : "Write a review"}
          </button>
        </div>

        {showForm && (
          <div className="mb-12 max-w-3xl">
            <ReviewForm
              productId={p.id}
              onSubmitted={() => {
                setTimeout(() => {
                  queryClient.invalidateQueries({ queryKey: ["product", slug] });
                  setShowForm(false);
                }, 1500);
              }}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Stats */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <div className="text-center lg:text-left">
              <p className="font-display text-7xl leading-none tabular-nums">{avgRating.toFixed(1)}</p>
              <div className="flex lg:justify-start justify-center mt-3">
                <Stars value={avgRating} size={18} />
              </div>
              <p className="text-sm text-muted mt-2">
                Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </p>
            </div>

            {reviews.length > 0 && (
              <div className="mt-8 space-y-2">
                {distribution.map((d) => (
                  <div key={d.star} className="flex items-center gap-3 text-xs">
                    <span className="w-3 text-muted tabular-nums">{d.star}</span>
                    <Star size={11} className="fill-terracotta text-terracotta" />
                    <div className="flex-1 h-1.5 bg-sand/60 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(d.count / maxDist) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-charcoal"
                      />
                    </div>
                    <span className="w-6 text-right text-muted tabular-nums">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review list */}
          <div className="lg:col-span-8">
            {reviews.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-charcoal/20">
                <p className="font-display text-2xl mb-2">No reviews yet</p>
                <p className="text-muted mb-6">Be the first to share your experience.</p>
                <button onClick={() => setShowForm(true)} className="btn btn-outline">Write a review</button>
              </div>
            ) : (
              <div className="space-y-10">
                {reviews.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="pb-10 border-b border-charcoal/10 last:border-0"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center font-display text-lg text-terracotta">
                          {(r.user?.name ?? "A")[0]}
                        </div>
                        <div>
                          <p className="font-medium">{r.user?.name ?? "Anonymous"}</p>
                          <p className="text-xs text-muted">
                            {new Date(r.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <Stars value={r.rating} size={14} />
                    </div>
                    {r.title && <p className="font-display text-xl mt-4 mb-2">{r.title}</p>}
                    <p className="text-muted leading-relaxed">{r.body}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═════ Related ═════ */}
      {data.related?.length > 0 && (
        <section className="container mt-32">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Eyebrow>Continue exploring</Eyebrow>
              <h2 className="font-display text-4xl lg:text-5xl tracking-tightest">You may also like</h2>
            </div>
            <Link to="/shop" className="btn btn-outline hidden md:inline-flex">View all</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6">
            {data.related.map((r: any, i: number) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              >
                <ProductCard product={r} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ═════ Sticky mobile CTA ═════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-md border-t border-charcoal/10 px-4 py-3 flex items-center gap-3 shadow-2xl">
        <div className="flex-shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-muted truncate max-w-[100px]">{p.name}</p>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-lg tabular-nums">${Number(p.price).toLocaleString()}</p>
            {onSale && <p className="text-xs text-muted line-through tabular-nums">${Number(p.compareAt).toLocaleString()}</p>}
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="btn btn-terracotta flex-1 text-sm uppercase tracking-[0.15em] disabled:opacity-50"
        >
          {outOfStock ? "Sold Out" : "Add to Bag"}
        </button>
      </div>

      {/* ═════ Lightbox ═════ */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-50 bg-charcoal/95 backdrop-blur-sm flex items-center justify-center p-6 cursor-zoom-out"
          >
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-6 right-6 text-cream hover:opacity-70 transition"
              aria-label="Close"
            >
              <X size={28} />
            </button>
            <p className="absolute top-6 left-6 text-cream text-xs uppercase tracking-[0.3em] opacity-60">
              {String(active + 1).padStart(2, "0")} / {String(totalImages).padStart(2, "0")} — {p.name}
            </p>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={p.images[active]}
              alt={p.name}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═════ Toast ═════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 lg:bottom-8 left-1/2 z-50 bg-charcoal text-cream px-5 py-3 shadow-xl flex items-center gap-3"
          >
            <Check size={16} className="text-terracotta" />
            <span className="text-sm">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
