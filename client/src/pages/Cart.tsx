import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";

export default function Cart() {
  const { items, remove, updateQty, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-32 text-center">
        <h1 className="text-5xl mb-4">Your bag is empty</h1>
        <p className="text-muted mb-8">Discover pieces made to be lived with.</p>
        <Link to="/shop" className="btn btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-16">
      <h1 className="text-5xl mb-12">Shopping Bag</h1>
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((i) => (
            <div key={i.productId} className="flex gap-6 border-b border-charcoal/10 pb-6">
              <img src={i.image} alt={i.name} className="w-32 h-32 object-cover" />
              <div className="flex-1">
                <h3 className="font-medium">{i.name}</h3>
                <p className="text-muted text-sm mb-3">${i.price.toFixed(0)}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQty(i.productId, Math.max(1, i.quantity - 1))} className="w-8 h-8 border border-charcoal/20">−</button>
                  <span>{i.quantity}</span>
                  <button onClick={() => updateQty(i.productId, i.quantity + 1)} className="w-8 h-8 border border-charcoal/20">+</button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${(i.price * i.quantity).toFixed(0)}</p>
                <button onClick={() => remove(i.productId)} className="text-muted hover:text-terracotta mt-2">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <aside className="bg-sand/40 p-8 h-fit">
          <h2 className="text-2xl mb-6">Summary</h2>
          <div className="space-y-3 text-sm border-b border-charcoal/10 pb-4 mb-4">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal().toFixed(2)}</span></div>
            <div className="flex justify-between text-muted"><span>Shipping</span><span>Calculated at checkout</span></div>
          </div>
          <div className="flex justify-between text-lg mb-6">
            <span>Total</span><span>${subtotal().toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn btn-primary w-full">Checkout</Link>
        </aside>
      </div>
    </motion.div>
  );
}
