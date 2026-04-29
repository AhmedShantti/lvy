import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, UserCheck, AlertCircle } from "lucide-react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";

type Step = 1 | 2 | 3;

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  fullName: "Full name",
  line1: "Address line 1",
  line2: "Apartment, suite (optional)",
  city: "City",
  region: "State / Region",
  postal: "Postal code",
  country: "Country",
  phone: "Phone",
};

const REQUIRED_FIELDS = ["email", "fullName", "line1", "city", "region", "postal", "country", "phone"];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [tier, setTier] = useState<"STANDARD" | "EXPRESS" | "WHITE_GLOVE">("STANDARD");
  const [form, setForm] = useState({
    email: "", fullName: "", line1: "", line2: "", city: "",
    region: "", postal: "", country: "USA", phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Prefill from user
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        email: f.email || user.email,
        fullName: f.fullName || user.name,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0) nav("/cart");
  }, [items.length, nav]);

  const shipping = tier === "WHITE_GLOVE" ? 199 : tier === "EXPRESS" ? 60 : subtotal() >= 1500 ? 0 : 25;
  const tax = +(subtotal() * 0.08).toFixed(2);
  const total = subtotal() + shipping + tax;

  const validate = () => {
    const errs: Record<string, string> = {};
    for (const k of REQUIRED_FIELDS) {
      if (!form[k as keyof typeof form]?.trim()) errs[k] = "Required";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Invalid email";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const placeOrder = async () => {
    setServerError(null);
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        email: form.email,
        address: form,
        deliveryTier: tier,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, variant: i.variant })),
      });
      clear();
      nav(`/order/${data.order.number}`);
    } catch (e: any) {
      setServerError(e?.response?.data?.error ?? "Something went wrong placing the order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-12 lg:py-16">
      <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-4 flex items-center gap-3">
        <span className="w-8 h-px bg-terracotta" /> Secure checkout
      </p>
      <h1 className="font-display text-5xl lg:text-6xl mb-10 leading-[0.95] tracking-tightest">Checkout</h1>

      {/* Auth banner */}
      <div className="mb-10 p-5 border border-charcoal/15 bg-sand/30 flex items-center justify-between gap-4">
        {user ? (
          <>
            <div className="flex items-center gap-3">
              <UserCheck size={20} className="text-emerald-700" />
              <div>
                <p className="text-sm font-medium">Signed in as {user.name}</p>
                <p className="text-xs text-muted">{user.email}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <User size={20} className="text-muted" />
              <div>
                <p className="text-sm font-medium">Continuing as guest</p>
                <p className="text-xs text-muted">You can create an account after placing your order.</p>
              </div>
            </div>
            <Link to="/login" className="text-xs uppercase tracking-[0.3em] border-b border-charcoal pb-0.5 whitespace-nowrap">
              Sign in
            </Link>
          </>
        )}
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-4 mb-12 text-xs uppercase tracking-[0.3em]">
        {["Shipping", "Delivery", "Payment"].map((label, i) => {
          const idx = (i + 1) as Step;
          const active = step === idx;
          const done = step > idx;
          return (
            <div key={label} className="flex items-center gap-4">
              <button
                onClick={() => (done ? setStep(idx) : null)}
                className={`flex items-center gap-2 transition ${
                  active ? "text-charcoal" : done ? "text-muted hover:text-charcoal" : "text-muted/50"
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                  active ? "bg-charcoal text-cream" : done ? "bg-terracotta text-cream" : "border border-charcoal/20"
                }`}>{i + 1}</span>
                {label}
              </button>
              {i < 2 && <span className="w-8 h-px bg-charcoal/15" />}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(["email","fullName","line1","line2","city","region","postal","country","phone"] as const).map((k) => (
                <div key={k} className={k === "line1" || k === "line2" ? "md:col-span-2" : ""}>
                  <label className="text-xs uppercase tracking-[0.25em] text-muted block mb-2">
                    {FIELD_LABELS[k]}
                    {REQUIRED_FIELDS.includes(k) && <span className="text-terracotta ml-1">*</span>}
                  </label>
                  <input
                    value={form[k]}
                    onChange={(e) => {
                      setForm({ ...form, [k]: e.target.value });
                      if (errors[k]) setErrors({ ...errors, [k]: "" });
                    }}
                    className={`w-full border-b bg-transparent py-2 outline-none transition ${
                      errors[k] ? "border-terracotta" : "border-charcoal/20 focus:border-charcoal"
                    }`}
                  />
                  {errors[k] && <p className="text-xs text-terracotta mt-1">{errors[k]}</p>}
                </div>
              ))}
              <button
                className="btn btn-primary md:col-span-2 mt-6"
                onClick={() => {
                  if (validate()) setStep(2);
                }}
              >
                Continue to Delivery
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {[
                { id: "STANDARD" as const, name: "Standard Delivery", desc: "5–8 business days", price: subtotal() >= 1500 ? 0 : 25 },
                { id: "EXPRESS" as const, name: "Express Delivery", desc: "2–3 business days", price: 60 },
                { id: "WHITE_GLOVE" as const, name: "White Glove", desc: "Includes assembly & placement", price: 199 },
              ].map((t) => (
                <label
                  key={t.id}
                  className={`flex justify-between items-center p-6 border cursor-pointer transition ${
                    tier === t.id ? "border-charcoal bg-sand/30" : "border-charcoal/15 hover:border-charcoal/40"
                  }`}
                >
                  <div className="flex gap-4 items-center">
                    <input type="radio" checked={tier === t.id} onChange={() => setTier(t.id)} />
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-sm text-muted">{t.desc}</p>
                    </div>
                  </div>
                  <span className="font-display text-lg">{t.price === 0 ? "Free" : `$${t.price}`}</span>
                </label>
              ))}
              <div className="flex gap-3 pt-4">
                <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary flex-1" onClick={() => setStep(3)}>Continue to Payment</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="border border-charcoal/15 p-6 mb-6">
                <p className="text-sm text-muted mb-4">
                  Stripe / PayPal integration is wired on the backend. In test mode, click below to simulate placing the order.
                </p>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted">Ship to:</span> {form.fullName}, {form.line1}, {form.city}</p>
                  <p><span className="text-muted">Email:</span> {form.email}</p>
                  <p><span className="text-muted">Delivery:</span> {tier.replace("_", " ")}</p>
                </div>
              </div>
              {serverError && (
                <div className="mb-4 p-4 border border-terracotta/40 bg-terracotta/10 text-sm flex items-center gap-3">
                  <AlertCircle size={18} className="text-terracotta flex-shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}
              <div className="flex gap-3">
                <button className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary flex-1" disabled={placing} onClick={placeOrder}>
                  {placing ? "Placing order…" : `Place Order — $${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start bg-sand/40 p-8 h-fit">
          <h2 className="font-display text-xl mb-6">Order Summary</h2>
          <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
            {items.map((i) => (
              <div key={i.productId} className="flex gap-3 text-sm">
                <img src={i.image} alt="" className="w-16 h-16 object-cover flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{i.name}</p>
                  <p className="text-muted text-xs">Qty {i.quantity}</p>
                </div>
                <span className="tabular-nums">${(i.price * i.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-charcoal/10 pt-4">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="tabular-nums">${subtotal().toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="tabular-nums">${shipping.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Tax</span><span className="tabular-nums">${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-display text-xl pt-3 border-t border-charcoal/10 mt-3">
              <span>Total</span><span className="tabular-nums">${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
