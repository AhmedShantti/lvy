import { useState, useMemo } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Heart, MapPin, Settings, LogOut, ChevronRight,
  ArrowUpRight, Mail, ShieldCheck, User as UserIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";

type Tab = "overview" | "orders" | "wishlist" | "profile";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: UserIcon },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "profile", label: "Profile", icon: Settings },
];

function fmtMoney(n: number) { return `EGP ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtDate(d: string | Date) { return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-muted",
  CONFIRMED: "text-charcoal",
  PACKED: "text-charcoal",
  SHIPPED: "text-terracotta",
  OUT_FOR_DELIVERY: "text-terracotta",
  DELIVERED: "text-sage",
  CANCELLED: "text-muted",
  REFUNDED: "text-terracotta",
};

export default function Account() {
  const { user, logout } = useAuth();
  const wish = useWishlist();
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "overview";

  const { data: ordersData } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => (await api.get("/orders/mine")).data,
    enabled: !!user,
  });

  // For wishlist, fetch a broad product list and filter by saved IDs
  const { data: wishProducts } = useQuery({
    queryKey: ["wishlist-products", wish.ids.join(",")],
    queryFn: async () => {
      if (wish.ids.length === 0) return { items: [] };
      return (await api.get("/products", { params: { limit: 48 } })).data;
    },
    enabled: !!user && wish.ids.length > 0,
  });

  const orders: any[] = ordersData?.items ?? [];
  const savedProducts = useMemo(
    () => (wishProducts?.items ?? []).filter((p: any) => wish.ids.includes(p.id)),
    [wishProducts, wish.ids]
  );

  if (!user) return <Navigate to="/login" />;

  const lifetimeSpent = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((s, o) => s + Number(o.total), 0);
  const inTransit = orders.filter((o) => ["SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status)).length;

  const setTab = (t: Tab) => setParams({ tab: t });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-12 lg:py-16">
      {/* ═════ Header ═════ */}
      <div className="relative mb-16">
        {/* Background watermark */}
        <p
          aria-hidden
          className="absolute -top-8 right-0 font-display text-[10rem] lg:text-[14rem] leading-none text-charcoal/[0.035] select-none pointer-events-none tracking-tightest"
        >
          {user.name.split(" ")[0].toLowerCase()}
        </p>

        <div className="relative flex items-start justify-between gap-8 flex-wrap">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-terracotta/15 flex items-center justify-center border border-terracotta/20">
              <span className="font-display text-4xl text-terracotta">{user.name[0]?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-2 flex items-center gap-3">
                <span className="w-8 h-px bg-terracotta" /> Your account
              </p>
              <h1 className="font-display text-5xl lg:text-6xl leading-[0.95] tracking-tightest">
                Hi, {user.name.split(" ")[0]}<span className="text-terracotta italic font-light">.</span>
              </h1>
              <p className="text-sm text-muted mt-2 flex items-center gap-2">
                <Mail size={12} /> {user.email}
                {user.role === "ADMIN" && (
                  <span className="ml-2 text-[10px] uppercase tracking-[0.2em] bg-charcoal text-cream px-2 py-0.5">
                    Admin
                  </span>
                )}
              </p>
            </div>
          </div>

          <button onClick={logout} className="btn btn-outline">
            <LogOut size={14} /> Sign out
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {[
            { label: "Orders placed", value: orders.length },
            { label: "Lifetime spent", value: fmtMoney(lifetimeSpent) },
            { label: "In transit", value: inTransit },
            { label: "Wishlist", value: wish.ids.length },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="border border-charcoal/10 p-6"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">{s.label}</p>
              <p className="font-display text-3xl mt-2 tabular-nums">{s.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═════ Tabs ═════ */}
      <div className="flex border-b border-charcoal/15 mb-10 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-0 pr-10 py-4 text-xs uppercase tracking-[0.3em] whitespace-nowrap transition ${
                active ? "text-charcoal" : "text-muted hover:text-charcoal"
              }`}
            >
              <Icon size={14} />
              {t.label}
              {active && (
                <motion.span
                  layoutId="account-tab-underline"
                  className="absolute left-0 right-10 -bottom-px h-0.5 bg-charcoal"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ═════ Tab content ═════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {tab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <div className="flex items-end justify-between mb-6">
                  <h2 className="font-display text-3xl">Recent orders</h2>
                  {orders.length > 3 && (
                    <button onClick={() => setTab("orders")} className="text-xs uppercase tracking-wider border-b border-charcoal pb-0.5 flex items-center gap-2">
                      View all <ArrowUpRight size={12} />
                    </button>
                  )}
                </div>

                {orders.length === 0 ? (
                  <EmptyPanel
                    icon={Package}
                    title="No orders yet"
                    body="When you place an order, it will appear here for easy tracking."
                    cta={<Link to="/shop" className="btn btn-primary">Start shopping</Link>}
                  />
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((o) => <OrderCard key={o.id} order={o} />)}
                  </div>
                )}
              </div>

              <aside className="space-y-4">
                <div className="border border-charcoal/10 p-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-terracotta mb-3">Next up</p>
                  {inTransit > 0 ? (
                    <>
                      <p className="font-display text-2xl mb-1">{inTransit} on the way</p>
                      <p className="text-sm text-muted">White-glove delivery will contact you to schedule.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-display text-2xl mb-1">All caught up</p>
                      <p className="text-sm text-muted">No deliveries pending right now.</p>
                    </>
                  )}
                </div>

                <div className="border border-charcoal/10 p-6 bg-sand/30">
                  <ShieldCheck size={18} className="text-terracotta mb-3" />
                  <p className="font-display text-xl mb-1">Every piece, warranted</p>
                  <p className="text-sm text-muted mb-4">5-year guarantee on joinery, hardware, and frames.</p>
                  <Link to="/about" className="text-xs uppercase tracking-wider border-b border-charcoal pb-0.5 inline-flex items-center gap-2">
                    Our promise <ArrowUpRight size={12} />
                  </Link>
                </div>

                <div className="border border-charcoal/10 p-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-3">Quick links</p>
                  <div className="space-y-2">
                    {[
                      { label: "Shop collection", to: "/shop", icon: Package },
                      { label: "Your wishlist", tab: "wishlist" as Tab, icon: Heart },
                      { label: "Edit profile", tab: "profile" as Tab, icon: Settings },
                    ].map((l) => {
                      const Icon = l.icon;
                      const content = (
                        <>
                          <div className="flex items-center gap-3">
                            <Icon size={14} />
                            <span className="text-sm">{l.label}</span>
                          </div>
                          <ChevronRight size={14} className="text-muted" />
                        </>
                      );
                      return l.to ? (
                        <Link key={l.label} to={l.to} className="flex items-center justify-between p-2 hover:bg-sand/40 transition">{content}</Link>
                      ) : (
                        <button key={l.label} onClick={() => setTab(l.tab!)} className="w-full flex items-center justify-between p-2 hover:bg-sand/40 transition">{content}</button>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          )}

          {tab === "orders" && (
            <div className="max-w-4xl">
              {orders.length === 0 ? (
                <EmptyPanel
                  icon={Package}
                  title="No orders yet"
                  body="Your order history will appear here once you make your first purchase."
                  cta={<Link to="/shop" className="btn btn-primary">Start shopping</Link>}
                />
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => <OrderCard key={o.id} order={o} expanded />)}
                </div>
              )}
            </div>
          )}

          {tab === "wishlist" && (
            <div>
              {wish.ids.length === 0 ? (
                <EmptyPanel
                  icon={Heart}
                  title="Your wishlist is empty"
                  body="Tap the heart on any product to save it here for later."
                  cta={<Link to="/shop" className="btn btn-primary">Browse pieces</Link>}
                />
              ) : savedProducts.length === 0 ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-40 bg-sand/40 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {savedProducts.map((p: any) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="relative group">
                        <Link to={`/product/${p.slug}`} className="block">
                          <div className="aspect-[3/4] overflow-hidden bg-sand/40">
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                          </div>
                        </Link>
                        <button
                          onClick={() => wish.toggle(p.id)}
                          aria-label="Remove from wishlist"
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-cream/95 backdrop-blur flex items-center justify-center shadow hover:bg-terracotta hover:text-cream transition"
                        >
                          <Heart size={14} className="fill-terracotta text-terracotta group-hover:fill-cream group-hover:text-cream" />
                        </button>
                      </div>
                      <div className="mt-3 flex justify-between items-start">
                        <div>
                          <p className="font-display text-base">{p.name}</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted">{p.material}</p>
                        </div>
                        <p className="font-display text-base tabular-nums">EGP {Number(p.price).toFixed(0)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "profile" && (
            <div className="grid lg:grid-cols-3 gap-10 max-w-5xl">
              <div className="lg:col-span-2 space-y-6">
                <div className="border border-charcoal/10 p-8">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta mb-6">Personal information</p>
                  <div className="grid md:grid-cols-2 gap-5">
                    <ReadOnlyField label="Full name" value={user.name} />
                    <ReadOnlyField label="Email" value={user.email} />
                    <ReadOnlyField label="Account type" value={user.role === "ADMIN" ? "Administrator" : "Customer"} />
                    <ReadOnlyField label="Member since" value="—" />
                  </div>
                  <p className="text-xs text-muted mt-6">
                    Contact <a href="mailto:support@lvy.shop" className="underline">support@lvy.shop</a> to update your details.
                  </p>
                </div>

                <div className="border border-charcoal/10 p-8">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta mb-4">Security</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted">Last updated — not tracked</p>
                    </div>
                    <button className="btn btn-outline" disabled>Change password</button>
                  </div>
                </div>
              </div>

              <aside>
                <div className="border border-charcoal/10 p-6 bg-sand/30">
                  <MapPin size={18} className="text-terracotta mb-3" />
                  <p className="font-display text-xl mb-1">Saved addresses</p>
                  <p className="text-sm text-muted mb-4">Addresses you've used at checkout will appear here.</p>
                  <p className="text-xs text-muted italic">Coming soon</p>
                </div>
              </aside>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function OrderCard({ order, expanded = false }: { order: any; expanded?: boolean }) {
  return (
    <Link
      to={`/order/${order.number}`}
      className="block border border-charcoal/10 hover:border-charcoal p-6 group transition"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">{fmtDate(order.createdAt)}</p>
          <p className="font-display text-xl tabular-nums mt-1">{order.number}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl tabular-nums">{fmtMoney(order.total)}</p>
          <p className={`text-[10px] uppercase tracking-[0.2em] ${STATUS_COLOR[order.status] ?? "text-muted"}`}>
            {order.status.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-3">
          {order.items.slice(0, 4).map((i: any) => (
            i.image && (
              <img
                key={i.id}
                src={i.image}
                alt=""
                className="w-12 h-12 object-cover border-2 border-cream"
              />
            )
          ))}
          {order.items.length > 4 && (
            <div className="w-12 h-12 border-2 border-cream bg-sand/60 flex items-center justify-center text-xs">
              +{order.items.length - 4}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted group-hover:text-charcoal group-hover:gap-3 transition-all">
          View details <ChevronRight size={12} />
        </div>
      </div>

      {expanded && order.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-charcoal/10 text-sm text-muted">
          {order.items.map((i: any) => i.name).join(" · ")}
        </div>
      )}
    </Link>
  );
}

function EmptyPanel({ icon: Icon, title, body, cta }: {
  icon: any; title: string; body: string; cta?: React.ReactNode;
}) {
  return (
    <div className="py-20 text-center border border-dashed border-charcoal/20">
      <div className="w-14 h-14 mx-auto rounded-full bg-sand/60 flex items-center justify-center mb-5">
        <Icon size={22} className="text-muted" />
      </div>
      <p className="font-display text-2xl mb-2">{title}</p>
      <p className="text-sm text-muted max-w-md mx-auto mb-6">{body}</p>
      {cta}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">{label}</label>
      <p className="border-b border-charcoal/10 pb-2">{value}</p>
    </div>
  );
}
