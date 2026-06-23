import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, UserCheck, AlertCircle, Lock, RotateCcw, ShieldCheck, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";

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

const AUTOCOMPLETE: Record<string, string> = {
  email: "email", fullName: "name", line1: "address-line1", line2: "address-line2",
  city: "address-level2", region: "address-level1", postal: "postal-code",
  country: "country-name", phone: "tel",
};

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [tier, setTier] = useState<"STANDARD" | "EXPRESS" | "WHITE_GLOVE">("STANDARD");
  const [form, setForm] = useState({
    email: "", fullName: "", line1: "", line2: "", city: "",
    region: "", postal: "", country: "USA", phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
      errs.email = "Enter a valid email";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) {
      const first = document.querySelector('[aria-invalid="true"]') as HTMLElement | null;
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first?.focus?.();
      return;
    }
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

  const DELIVERY = [
    { id: "STANDARD" as const, name: "Standard", desc: "5–8 business days", price: subtotal() >= 1500 ? 0 : 25 },
    { id: "EXPRESS" as const, name: "Express", desc: "2–3 business days", price: 60 },
    { id: "WHITE_GLOVE" as const, name: "White Glove", desc: "Includes assembly & placement", price: 199 },
  ];

  const renderField = (k: keyof typeof form) => {
    const required = REQUIRED_FIELDS.includes(k);
    const invalid = !!errors[k];
    return (
      <div key={k} className={k === "line1" || k === "line2" ? "sm:col-span-2" : ""}>
        <label htmlFor={`f-${k}`} className="field-label">
          {FIELD_LABELS[k]}{required && <span className="ml-1 text-terracotta">*</span>}
        </label>
        <input
          id={`f-${k}`}
          value={form[k]}
          type={k === "email" ? "email" : k === "phone" ? "tel" : "text"}
          inputMode={k === "email" ? "email" : k === "phone" ? "tel" : undefined}
          autoComplete={AUTOCOMPLETE[k]}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `e-${k}` : undefined}
          onChange={(e) => {
            setForm({ ...form, [k]: e.target.value });
            if (errors[k]) setErrors({ ...errors, [k]: "" });
          }}
          className={`input ${invalid ? "border-terracotta focus:border-terracotta focus:ring-terracotta/15" : ""}`}
        />
        {invalid && <p id={`e-${k}`} className="mt-1.5 text-xs text-terracotta">{errors[k]}</p>}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-12 pb-28 lg:py-16 lg:pb-16">
      <div className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-stone">
        <Lock size={13} className="text-terracotta" /> Secure checkout
      </div>
      <h1 className="mb-10 font-display text-[clamp(2.25rem,4vw,3.25rem)] leading-[0.95] tracking-tightest">Checkout</h1>

      <div className="grid gap-10 lg:grid-cols-3 lg:gap-14">
        {/* ── Form ── */}
        <div className="space-y-10 lg:col-span-2">
          {/* Contact */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl tracking-tightest">Contact</h2>
              {!user && (
                <Link to="/login" className="link-underline pb-0.5 text-[11px] uppercase tracking-[0.25em] text-charcoal/70 hover:text-charcoal">
                  Sign in
                </Link>
              )}
            </div>
            <div className="mb-5 flex items-center gap-3 rounded-md border border-charcoal/12 bg-sand/30 p-4">
              {user ? <UserCheck size={18} className="text-sage" /> : <User size={18} className="text-stone" />}
              <p className="text-sm text-stone">
                {user ? <>Signed in as <span className="text-charcoal">{user.name}</span></> : "Continuing as guest — you can create an account after ordering."}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {renderField("email")}
            </div>
          </section>

          {/* Shipping address */}
          <section>
            <h2 className="mb-5 font-display text-xl tracking-tightest">Shipping address</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {(["fullName", "line1", "line2", "city", "region", "postal", "country", "phone"] as const).map(renderField)}
            </div>
          </section>

          {/* Delivery */}
          <section>
            <h2 className="mb-5 font-display text-xl tracking-tightest">Delivery method</h2>
            <div className="space-y-3">
              {DELIVERY.map((t) => (
                <label
                  key={t.id}
                  className={`flex cursor-pointer items-center justify-between rounded-md border p-5 transition ${
                    tier === t.id ? "border-charcoal bg-sand/30" : "border-charcoal/15 hover:border-charcoal/40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="delivery"
                      checked={tier === t.id}
                      onChange={() => setTier(t.id)}
                      className="accent-charcoal"
                    />
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-sm text-stone">{t.desc}</p>
                    </div>
                  </div>
                  <span className="font-display text-lg tabular-nums">{t.price === 0 ? "Free" : `EGP ${t.price}`}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="mb-5 font-display text-xl tracking-tightest">Payment</h2>
            <div className="rounded-md border border-charcoal/15 p-5">
              <p className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck size={16} className="text-sage" /> Encrypted, secure payment
              </p>
              <p className="mt-2 text-sm text-stone">
                Payment is processed securely via Stripe. In test mode, your order is placed without a charge.
              </p>
            </div>
            {serverError && (
              <div className="mt-4 flex items-center gap-3 rounded-md border border-terracotta/40 bg-terracotta/10 p-4 text-sm" role="alert">
                <AlertCircle size={18} className="flex-shrink-0 text-terracotta" />
                <span>{serverError}</span>
              </div>
            )}
          </section>
        </div>

        {/* ── Summary ── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-sand/40 p-7">
            <h2 className="mb-5 font-display text-xl tracking-tightest">Order summary</h2>

            <ul className="mb-5 max-h-72 space-y-3 overflow-y-auto">
              {items.map((i) => (
                <li key={i.productId} className="flex items-center gap-3 text-sm">
                  <div className="relative flex-shrink-0">
                    <img src={i.image} alt="" className="h-14 w-14 rounded border border-charcoal/10 object-cover" />
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-charcoal px-1 text-[10px] tabular-nums text-cream">
                      {i.quantity}
                    </span>
                  </div>
                  <p className="line-clamp-2 flex-1 leading-snug">{i.name}</p>
                  <span className="tabular-nums">EGP {(i.price * i.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <dl className="space-y-2 border-t border-charcoal/12 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd className="tabular-nums">EGP {subtotal().toFixed(2)}</dd></div>
              <div className="flex justify-between"><dt className="text-stone">Shipping</dt><dd className="tabular-nums">{shipping === 0 ? "Free" : `EGP ${shipping.toFixed(2)}`}</dd></div>
              <div className="flex justify-between"><dt className="text-stone">Tax</dt><dd className="tabular-nums">EGP {tax.toFixed(2)}</dd></div>
            </dl>

            <div className="mb-6 mt-4 flex items-baseline justify-between border-t border-charcoal/12 pt-4">
              <span className="text-[11px] uppercase tracking-[0.25em] text-stone">Total</span>
              <span className="font-display text-3xl tabular-nums">EGP {total.toFixed(2)}</span>
            </div>

            <button
              onClick={placeOrder}
              disabled={placing}
              className="btn btn-terracotta hidden w-full text-sm uppercase tracking-[0.15em] disabled:opacity-60 lg:inline-flex"
            >
              {placing ? "Placing order…" : "Place Order"}
              {!placing && <ArrowRight size={16} />}
            </button>

            <ul className="mt-5 space-y-2 text-[11px] text-stone">
              <li className="flex items-center gap-2"><Lock size={12} className="text-terracotta/70" /> Secure, encrypted checkout — no hidden fees</li>
              <li className="flex items-center gap-2"><RotateCcw size={12} className="text-terracotta/70" /> 30-day returns</li>
              <li className="flex items-center gap-2"><ShieldCheck size={12} className="text-terracotta/70" /> Support available at every step</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* ── Mobile sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-4 border-t border-charcoal/10 bg-cream/95 px-4 py-3 shadow-md backdrop-blur-md lg:hidden">
        <div className="flex-shrink-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone">Total</p>
          <p className="font-display text-xl leading-none tabular-nums">EGP {total.toFixed(2)}</p>
        </div>
        <button
          onClick={placeOrder}
          disabled={placing}
          className="btn btn-terracotta flex-1 text-sm uppercase tracking-[0.15em] disabled:opacity-60"
        >
          {placing ? "Placing…" : "Place Order"}
        </button>
      </div>
    </motion.div>
  );
}
