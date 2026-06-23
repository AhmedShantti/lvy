import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";

export default function Cart() {
  const { items, remove, updateQty, subtotal } = useCart();
  const total = subtotal();

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center py-32 text-center">
        <h1 className="font-display text-4xl tracking-tightest md:text-5xl">Your bag is empty</h1>
        <p className="mt-4 text-stone">Discover pieces made to be lived with.</p>
        <Link to="/shop" className="btn btn-primary mt-8">Shop the collection</Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-12 pb-28 lg:py-16 lg:pb-16">
      <header className="mb-10 flex items-end justify-between border-b border-charcoal/10 pb-6">
        <h1 className="font-display text-[clamp(2.25rem,4vw,3.25rem)] tracking-tightest">Shopping Bag</h1>
        <Link to="/shop" className="link-underline pb-0.5 text-[11px] uppercase tracking-[0.25em] text-charcoal/70 hover:text-charcoal">
          Continue shopping
        </Link>
      </header>

      <div className="grid gap-10 lg:grid-cols-3 lg:gap-14">
        {/* ── Items ── */}
        <ul className="lg:col-span-2">
          {items.map((i) => (
            <li key={i.productId} className="flex gap-5 border-b border-charcoal/10 py-6 first:pt-0">
              <img
                src={i.image}
                alt={i.name}
                className="h-28 w-24 flex-shrink-0 rounded-md border border-charcoal/10 object-cover sm:h-32 sm:w-28"
              />

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg leading-tight">{i.name}</h3>
                    {i.variant && (
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone">{i.variant}</p>
                    )}
                    <p className="mt-1 text-sm text-stone tabular-nums">EGP {i.price.toFixed(2)} each</p>
                  </div>
                  <p className="font-display text-lg tabular-nums">EGP {(i.price * i.quantity).toFixed(2)}</p>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  {/* Quantity */}
                  <div className="flex items-center rounded-full border border-charcoal/20">
                    <button
                      onClick={() => updateQty(i.productId, Math.max(1, i.quantity - 1))}
                      disabled={i.quantity <= 1}
                      aria-label={`Decrease quantity of ${i.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-sand/50 disabled:opacity-40"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium tabular-nums" aria-live="polite">
                      {i.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(i.productId, i.quantity + 1)}
                      aria-label={`Increase quantity of ${i.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-sand/50"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => remove(i.productId)}
                    aria-label={`Remove ${i.name} from bag`}
                    className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-stone transition hover:text-terracotta"
                  >
                    <Trash2 size={14} /> <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* ── Summary ── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-sand/40 p-7">
            <h2 className="font-display text-2xl tracking-tightest">Order summary</h2>

            <dl className="mt-6 space-y-3 border-b border-charcoal/15 pb-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone">Subtotal</dt>
                <dd className="tabular-nums">EGP {total.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone">Shipping</dt>
                <dd className="text-stone">Calculated at checkout</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone">Taxes</dt>
                <dd className="text-stone">Calculated at checkout</dd>
              </div>
            </dl>

            <div className="mb-6 mt-5 flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-[0.25em] text-stone">Total</span>
              <span className="font-display text-3xl tabular-nums">EGP {total.toFixed(2)}</span>
            </div>

            <Link
              to="/checkout"
              className="btn btn-terracotta w-full text-sm uppercase tracking-[0.15em]"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>

            <p className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone">
              <Lock size={12} /> Secure checkout · 30-day returns
            </p>
          </div>
        </aside>
      </div>

      {/* ── Mobile sticky checkout bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-4 border-t border-charcoal/10 bg-cream/95 px-4 py-3 shadow-md backdrop-blur-md lg:hidden">
        <div className="flex-shrink-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone">Total</p>
          <p className="font-display text-xl tabular-nums leading-none">EGP {total.toFixed(2)}</p>
        </div>
        <Link to="/checkout" className="btn btn-terracotta flex-1 text-sm uppercase tracking-[0.15em]">
          Checkout <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
}
