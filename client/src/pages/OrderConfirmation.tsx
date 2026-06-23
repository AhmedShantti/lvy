import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, UserPlus, Package } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

const steps = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function OrderConfirmation() {
  const { number } = useParams();
  const { user } = useAuth();
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["order", number],
    queryFn: async () => (await api.get(`/orders/${number}`)).data,
  });
  const order = data?.order;

  const isGuestOrder = order && !order.userId;
  const canClaim = user && isGuestOrder && user.email.toLowerCase() === order?.email?.toLowerCase();

  const claimOrder = async () => {
    if (!order) return;
    setClaiming(true);
    setClaimError(null);
    try {
      await api.post("/orders/claim", { number: order.number, email: order.email });
      setClaimed(true);
    } catch (e: any) {
      setClaimError(e?.response?.data?.error ?? "Could not link this order");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container py-16 lg:py-24 max-w-3xl"
    >
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 mx-auto bg-terracotta/15 rounded-full flex items-center justify-center mb-6"
        >
          <Check className="text-terracotta" size={36} />
        </motion.div>
        <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-4">Order placed</p>
        <h1 className="font-display text-5xl lg:text-6xl mb-4 leading-[0.95]">Thank you</h1>
        <p className="text-muted">
          Your order <span className="text-charcoal font-medium tabular-nums">{number}</span> has been placed.
        </p>
        {order?.email && (
          <p className="text-xs text-muted mt-2">A confirmation email was sent to {order.email}</p>
        )}
      </div>

      {/* Claim card for guests */}
      {isGuestOrder && !user && !claimed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10 border border-terracotta/30 bg-terracotta/5 p-8 flex gap-5 items-start"
        >
          <div className="w-12 h-12 rounded-full bg-terracotta/15 flex items-center justify-center flex-shrink-0">
            <UserPlus size={22} className="text-terracotta" />
          </div>
          <div className="flex-1">
            <p className="font-display text-xl mb-2">Track your order with an account</p>
            <p className="text-sm text-muted mb-4">
              Create a free LVY account with the same email <span className="text-charcoal">({order.email})</span>,
              and this order will automatically be linked for easy tracking and reordering.
            </p>
            <div className="flex gap-3">
              <Link to="/register" className="btn btn-primary">Create account</Link>
              <Link to="/login" className="btn btn-outline">Sign in</Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Claim for signed-in user whose email matches */}
      {canClaim && !claimed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 border border-charcoal/15 bg-sand/40 p-6 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Package size={20} />
            <div>
              <p className="text-sm font-medium">Link this order to your account</p>
              <p className="text-xs text-muted">Signed in as {user.email}</p>
            </div>
          </div>
          <button onClick={claimOrder} disabled={claiming} className="btn btn-primary disabled:opacity-50">
            {claiming ? "Linking…" : "Link order"}
          </button>
        </motion.div>
      )}

      {claimed && (
        <div className="mb-10 border border-sage/30 bg-sage/10 p-5 flex items-center gap-3">
          <Check size={18} className="text-sage" />
          <p className="text-sm">Order linked to your account. View it anytime in <Link to="/account" className="underline">your account</Link>.</p>
        </div>
      )}

      {claimError && (
        <div className="mb-6 border border-terracotta/30 bg-terracotta/5 p-4 text-sm text-terracotta">
          {claimError}
        </div>
      )}

      {order && (
        <>
          <div className="bg-sand/30 p-8 mb-8">
            <h2 className="font-display text-xl mb-8">Delivery status</h2>
            <div className="flex justify-between relative">
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-charcoal/15" />
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(steps.indexOf(order.status) / (steps.length - 1)) * 100}%`,
                }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute top-3 left-0 h-0.5 bg-terracotta"
              />
              {steps.map((s, i) => {
                const isActive = steps.indexOf(order.status) >= i;
                return (
                  <div key={s} className="relative z-10 flex flex-col items-center text-[10px] uppercase tracking-wider">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isActive ? "bg-terracotta" : "bg-cream border border-charcoal/20"
                    }`}>
                      {isActive && <Check size={12} className="text-cream" />}
                    </div>
                    <span className="mt-2 text-muted text-center w-16 text-[9px]">{s.replace(/_/g, " ")}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-xl mb-5">Items</h2>
            <div className="space-y-4">
              {order.items.map((i: any) => (
                <div key={i.id} className="flex gap-4 border-b border-charcoal/10 pb-4">
                  {i.image && <img src={i.image} className="w-20 h-20 object-cover" />}
                  <div className="flex-1">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-sm text-muted">Qty {i.quantity} · ${Number(i.price).toFixed(0)} each</p>
                  </div>
                  <p className="font-display tabular-nums">EGP {(Number(i.price) * i.quantity).toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sand/30 p-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="tabular-nums">EGP {Number(order.subtotal).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="tabular-nums">EGP {Number(order.shipping).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Tax</span><span className="tabular-nums">EGP {Number(order.tax).toFixed(2)}</span></div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-terracotta"><span>Discount</span><span className="tabular-nums">−${Number(order.discount).toFixed(2)}</span></div>
            )}
            <div className="flex justify-between font-display text-xl pt-3 border-t border-charcoal/10">
              <span>Total</span><span className="tabular-nums">EGP {Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </>
      )}

      <div className="text-center mt-12 flex gap-3 justify-center">
        <Link to="/shop" className="btn btn-outline">Continue shopping</Link>
        {user && <Link to="/account" className="btn btn-primary">View my orders</Link>}
      </div>
    </motion.div>
  );
}
