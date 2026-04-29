import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, User, Search, Menu, X, Heart, ArrowRight, Truck, Award, Leaf,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

const LINKS = [
  { to: "/shop", label: "Shop", hasMegaMenu: true },
  { to: "/about", label: "Journal" },
  { to: "/about", label: "Story" },
  { to: "/shipping", label: "Atelier" },
];

const TICKER = [
  { icon: Truck, text: "Complimentary white-glove delivery over $1,500" },
  { icon: Leaf, text: "FSC-certified wood · Made by hand in small batches" },
  { icon: Award, text: "5-year warranty on every piece we make" },
];

export default function Navbar() {
  const count = useCart((s) => s.count());
  const wishCount = useWishlist((s) => s.ids.length);
  const { user } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [cartBounce, setCartBounce] = useState(false);
  const lastScroll = useRef(0);
  const prevCount = useRef(count);

  // Scroll behavior: transparent/cream + hide on scroll down
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > 140 && y > lastScroll.current);
      lastScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-rotate announcement ticker
  useEffect(() => {
    const i = setInterval(() => setTickerIdx((v) => (v + 1) % TICKER.length), 4000);
    return () => clearInterval(i);
  }, []);

  // Bounce cart badge when count increases
  useEffect(() => {
    if (count > prevCount.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 600);
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  // Close overlays on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  // Lock body scroll when overlays are open
  useEffect(() => {
    const open = menuOpen || searchOpen;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, searchOpen]);

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -120 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50"
      >
        {/* ═════ Announcement ticker ═════ */}
        <div className="bg-charcoal text-cream overflow-hidden">
          <div className="container h-9 flex items-center justify-between text-[10px] uppercase tracking-[0.3em]">
            <div className="hidden md:flex items-center gap-6 text-cream/60">
              <span>EN · USD</span>
              <Link to="/shipping" className="hover:text-cream transition">Shipping</Link>
              <Link to="/about" className="hover:text-cream transition">Our craft</Link>
            </div>
            <div className="flex-1 md:flex-none h-full flex items-center justify-center md:justify-end overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tickerIdx}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  {(() => {
                    const Icon = TICKER[tickerIdx].icon;
                    return <Icon size={11} className="text-terracotta" />;
                  })()}
                  <span>{TICKER[tickerIdx].text}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ═════ Main bar ═════ */}
        <div
          className={cn(
            "transition-all duration-500 ease-soft",
            scrolled ? "bg-cream/95 backdrop-blur-xl border-b border-charcoal/10 shadow-sm" : "bg-transparent"
          )}
        >
          <div className="container flex items-center justify-between h-20 relative">
            {/* Logo */}
            <Link
              to="/"
              className="font-display text-3xl tracking-tightest leading-none relative group"
              onMouseEnter={() => setMegaOpen(false)}
            >
              <span className="relative z-10">lvy</span>
              <span className="absolute -top-1 -right-4 text-[8px] uppercase tracking-[0.3em] text-terracotta">®</span>
            </Link>

            {/* Center links */}
            <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
              {LINKS.map((l) => (
                <div
                  key={l.label}
                  className="relative"
                  onMouseEnter={() => setMegaOpen(l.hasMegaMenu ? true : false)}
                >
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      cn(
                        "relative text-xs uppercase tracking-[0.3em] py-2 transition",
                        isActive ? "text-charcoal" : "text-charcoal/70 hover:text-charcoal"
                      )
                    }
                  >
                    {l.label}
                    <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-charcoal scale-x-0 group-hover/link:scale-x-100 origin-right transition-transform duration-500" />
                  </NavLink>
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-charcoal/70 hover:text-terracotta transition group"
              >
                <Search size={17} />
                <span className="hidden xl:inline">Search</span>
              </button>

              <Link
                to="/account"
                aria-label="Account"
                className="hover:text-terracotta transition relative hidden sm:block"
              >
                <User size={19} />
                {user && (
                  <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-terracotta border border-cream" />
                )}
              </Link>

              <Link
                to="/account"
                aria-label="Wishlist"
                className="hover:text-terracotta transition relative hidden sm:block"
              >
                <Heart size={19} />
                {wishCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-terracotta text-cream text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-medium tabular-nums">
                    {wishCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative hover:text-terracotta transition" aria-label="Cart">
                <motion.div animate={cartBounce ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.5 }}>
                  <ShoppingBag size={19} />
                </motion.div>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-terracotta text-cream text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-medium tabular-nums"
                  >
                    {count}
                  </motion.span>
                )}
              </Link>

              <button
                className="lg:hidden"
                aria-label="Menu"
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* ═════ Mega menu dropdown ═════ */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onMouseLeave={() => setMegaOpen(false)}
              className="absolute left-0 right-0 top-full bg-cream/98 backdrop-blur-xl border-b border-charcoal/10 shadow-2xl"
            >
              <MegaMenu />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ═════ Full-screen search overlay ═════ */}
      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onPick={(slug) => {
          setSearchOpen(false);
          nav(`/product/${slug}`);
        }} />}
      </AnimatePresence>

      {/* ═════ Mobile drawer ═════ */}
      <AnimatePresence>
        {menuOpen && <MobileDrawer onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Mega menu
// ═══════════════════════════════════════════════════════════════════
function MegaMenu() {
  const { data: catsData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });
  const { data: featured } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => (await api.get("/products", { params: { featured: true, limit: 8 } })).data,
  });

  const categories = (catsData?.items ?? []).slice(0, 6);
  const featuredPiece = featured?.items?.[0];

  return (
    <div className="container py-10 grid grid-cols-12 gap-10">
      {/* Left: categories */}
      <div className="col-span-6">
        <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta mb-6">Shop by room</p>
        <div className="grid grid-cols-3 gap-4">
          {categories.map((c: any) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.slug}`}
              className="group block"
            >
              <div className="aspect-[4/5] overflow-hidden bg-sand/40">
                {c.image && (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="font-display text-lg">{c.name}</p>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted">
                {c._count?.products ?? 0} pieces
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Middle: quick links */}
      <div className="col-span-3 border-l border-charcoal/10 pl-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta mb-6">Collections</p>
        <ul className="space-y-3 text-sm">
          {[
            "New arrivals",
            "Best sellers",
            "Spring 2026",
            "On sale",
            "Limited editions",
            "Made-to-order",
          ].map((label) => (
            <li key={label}>
              <Link to="/shop" className="group flex items-center gap-2 hover:text-terracotta transition">
                {label}
                <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: featured piece card */}
      <div className="col-span-3 border-l border-charcoal/10 pl-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta mb-6">Featured</p>
        {featuredPiece ? (
          <Link to={`/product/${featuredPiece.slug}`} className="block group">
            <div className="aspect-[4/5] overflow-hidden bg-sand/40 mb-3">
              <img
                src={featuredPiece.images[0]}
                alt={featuredPiece.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
            </div>
            <p className="font-display text-lg">{featuredPiece.name}</p>
            <p className="text-xs text-muted tabular-nums">${Number(featuredPiece.price).toFixed(0)}</p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-terracotta group-hover:gap-3 flex items-center gap-2 transition-all">
              Discover <ArrowRight size={11} />
            </p>
          </Link>
        ) : (
          <div className="aspect-[4/5] bg-sand/40 animate-pulse" />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Full-screen search overlay with live results
// ═══════════════════════════════════════════════════════════════════
function SearchOverlay({ onClose, onPick }: { onClose: () => void; onPick: (slug: string) => void }) {
  const [q, setQ] = useState("");

  const { data } = useQuery({
    queryKey: ["search", q],
    queryFn: async () => (await api.get("/products", { params: { q, limit: 6 } })).data,
    enabled: q.length > 1,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-cream/98 backdrop-blur-xl"
    >
      <div className="container pt-12">
        <div className="flex items-center justify-between mb-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta">Search the collection</p>
          <button onClick={onClose} className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] hover:text-terracotta transition">
            Close <X size={16} />
          </button>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-4 border-b-2 border-charcoal pb-4"
        >
          <Search size={28} className="text-charcoal" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for sofas, chairs, lamps…"
            className="flex-1 bg-transparent font-display text-4xl lg:text-5xl outline-none placeholder:text-charcoal/20"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-muted hover:text-charcoal">
              <X size={24} />
            </button>
          )}
        </motion.div>

        <div className="mt-10">
          {q.length < 2 ? (
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-4">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {["Linen Sofa", "Walnut Table", "Boucle Chair", "Oak Bookshelf", "Marble Coffee", "Wool Rug"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setQ(s)}
                    className="px-4 py-2 border border-charcoal/20 text-sm hover:bg-charcoal hover:text-cream transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : !data ? (
            <p className="text-muted">Searching…</p>
          ) : data.items.length === 0 ? (
            <p className="text-muted italic">No pieces matched "{q}"</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((p: any) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => onPick(p.slug)}
                  className="flex gap-4 text-left group"
                >
                  <img src={p.images[0]} alt="" className="w-20 h-24 object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted">{p.category?.name}</p>
                    <p className="font-display text-lg group-hover:text-terracotta transition">{p.name}</p>
                    <p className="text-sm text-muted tabular-nums">${Number(p.price).toFixed(0)}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Mobile drawer
// ═══════════════════════════════════════════════════════════════════
function MobileDrawer({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] lg:hidden"
    >
      <div className="absolute inset-0 bg-charcoal/50" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-cream flex flex-col overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-charcoal/10">
          <Link to="/" className="font-display text-2xl">lvy</Link>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <nav className="flex-1 px-6 py-8 space-y-1">
          {LINKS.map((l, i) => (
            <motion.div
              key={l.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link
                to={l.to}
                className="flex items-center justify-between py-4 border-b border-charcoal/10 font-display text-3xl hover:text-terracotta transition"
                onClick={onClose}
              >
                {l.label}
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="px-6 py-6 border-t border-charcoal/10 space-y-4">
          {user ? (
            <>
              <Link to="/account" onClick={onClose} className="flex items-center gap-3 text-sm">
                <User size={16} /> {user.name}
              </Link>
              <button onClick={() => { logout(); onClose(); }} className="text-xs uppercase tracking-wider text-muted hover:text-terracotta">
                Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" onClick={onClose} className="btn btn-outline flex-1">Sign in</Link>
              <Link to="/register" onClick={onClose} className="btn btn-primary flex-1">Register</Link>
            </div>
          )}
          <div className="flex items-center gap-6 pt-4 text-xs uppercase tracking-[0.3em] text-muted">
            <span>EN · USD</span>
            <Link to="/shipping" onClick={onClose}>Shipping</Link>
            <Link to="/about" onClick={onClose}>Craft</Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
