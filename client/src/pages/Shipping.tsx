import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Truck, Package, Globe, RotateCcw, Shield, Clock, MapPin, ArrowUpRight, Check,
  Search, Play, Sparkles, X, ChevronDown,
} from "lucide-react";
import { api } from "@/lib/api";

const TIERS = [
  {
    key: "standard",
    name: "Standard",
    icon: Package,
    time: "5–8 business days",
    priceLabel: "Free over $1,500",
    note: "Curbside drop-off with signature.",
    highlight: false,
  },
  {
    key: "express",
    name: "Express",
    icon: Truck,
    time: "2–3 business days",
    priceLabel: "$60",
    note: "Priority dispatch, curbside delivery.",
    highlight: false,
  },
  {
    key: "whiteGlove",
    name: "White Glove",
    icon: Shield,
    time: "Scheduled appointment",
    priceLabel: "$199",
    note: "Two-person crew places it, assembles, and removes packaging.",
    highlight: true,
  },
];

const COMPARE_ROWS = [
  { label: "Speed", standard: "5–8 days", express: "2–3 days", whiteGlove: "By appointment" },
  { label: "Base price", standard: "$25 / free over $1,500", express: "$60", whiteGlove: "$199" },
  { label: "Curbside drop-off", standard: true, express: true, whiteGlove: true },
  { label: "Indoor placement", standard: false, express: false, whiteGlove: true },
  { label: "Assembly included", standard: false, express: false, whiteGlove: true },
  { label: "Packaging removal", standard: false, express: false, whiteGlove: true },
  { label: "Stairs & elevators", standard: false, express: false, whiteGlove: true },
  { label: "Appointment scheduling", standard: false, express: "Window", whiteGlove: "2-hour window" },
  { label: "Insurance", standard: true, express: true, whiteGlove: true },
];

const TIMELINE = [
  { label: "Order placed", body: "Confirmation email and receipt sent immediately." },
  { label: "Handcrafted", body: "Built by our atelier. Some pieces take 2–4 weeks when made-to-order." },
  { label: "Packed", body: "Individually protected with recycled, biodegradable materials." },
  { label: "Dispatched", body: "A tracking number goes live in your account." },
  { label: "Delivered", body: "White-glove teams will contact you to schedule a window." },
];

const RETURN_STEPS = [
  "Email support@lvy.shop within 30 days of delivery.",
  "We'll arrange a complimentary pickup at your convenience.",
  "Refund issued to your original method within 5 business days of inspection.",
];

const FAQ = [
  { q: "Do you ship internationally?", a: "Yes. We deliver to 48 countries. Duties and taxes are calculated at checkout — no surprises at the door." },
  { q: "What if my piece is made-to-order?", a: "Made-to-order pieces are built in 2–4 weeks before they ship. You'll see the lead time on the product page and in your order confirmation." },
  { q: "Can I change my delivery address after ordering?", a: "Contact us within 24 hours of placing your order. Once the piece is in production we lock the destination to protect delivery integrity." },
  { q: "What counts as a valid return?", a: "Any piece in original condition within 30 days of delivery. Made-to-order pieces are final sale unless arrived damaged." },
  { q: "Do you offer white-glove assembly?", a: "Yes — it's included in the White Glove tier. Two-person teams bring it inside, place it where you want, assemble it, and carry out the packaging." },
  { q: "How does tracking work?", a: "Once dispatched, a tracking number appears in your account and confirmation email. White Glove deliveries are scheduled directly with our crew by phone." },
  { q: "Can I pick up in-store?", a: "Pickup is available at our studio in Brooklyn, NY by appointment. Email us to arrange." },
];

const WHITE_GLOVE_CITIES: Record<string, string[]> = {
  "North America": ["New York", "Los Angeles", "Chicago", "San Francisco", "Boston", "Seattle", "Austin", "Miami", "Toronto", "Vancouver", "Montreal", "Portland"],
  "Europe": ["London", "Paris", "Berlin", "Amsterdam", "Milan", "Madrid", "Zürich", "Stockholm", "Copenhagen", "Barcelona", "Lisbon", "Dublin", "Vienna", "Brussels"],
  "Asia Pacific": ["Tokyo", "Singapore", "Sydney", "Melbourne", "Hong Kong", "Seoul", "Auckland", "Taipei"],
};

const CARRIERS = ["UPS", "FedEx", "DHL", "DB Schenker", "LVY Atelier"];

const TRACKING_STEPS = ["Order placed", "Handcrafted", "Packed", "Dispatched", "Delivered"];

const SECTIONS = [
  { id: "estimator", label: "Estimator" },
  { id: "tiers", label: "Tiers" },
  { id: "compare", label: "Compare" },
  { id: "timeline", label: "Timeline" },
  { id: "tracking", label: "Tracking" },
  { id: "reach", label: "Global reach" },
  { id: "returns", label: "Returns" },
  { id: "faq", label: "FAQ" },
];

export default function Shipping() {
  const [postal, setPostal] = useState("");
  const [subtotalInput, setSubtotalInput] = useState("1200");
  const [quote, setQuote] = useState<any>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [faqQuery, setFaqQuery] = useState("");
  const [activeSection, setActiveSection] = useState("estimator");

  // Scroll spy
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY + 120;
      for (const s of [...SECTIONS].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(s.id);
          return;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getQuote = async () => {
    if (!postal.trim()) return setQuoteError("Enter a postal code");
    setQuoting(true);
    setQuoteError(null);
    try {
      const { data } = await api.post("/shipping/quote", {
        postal: postal.trim(),
        subtotal: Number(subtotalInput) || 0,
      });
      setQuote(data);
    } catch (e: any) {
      setQuoteError("Could not calculate — try a valid postal code");
    } finally {
      setQuoting(false);
    }
  };

  const filteredFaq = useMemo(
    () => FAQ.filter((f) =>
      f.q.toLowerCase().includes(faqQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(faqQuery.toLowerCase())
    ),
    [faqQuery]
  );

  const totalCities = Object.values(WHITE_GLOVE_CITIES).reduce((s, arr) => s + arr.length, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
      {/* ═════ Hero ═════ */}
      <section className="container pt-16 lg:pt-24 pb-12 relative">
        <p
          aria-hidden
          className="absolute -top-4 right-0 font-display text-[10rem] lg:text-[16rem] leading-none text-charcoal/[0.04] select-none pointer-events-none tracking-tightest"
        >
          delivery
        </p>

        <div className="relative grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-5 flex items-center gap-3">
              <span className="w-8 h-px bg-terracotta" /> Shipping & Returns
            </p>
            <h1 className="font-display text-5xl lg:text-7xl leading-[0.92] tracking-tightest">
              Delivered with<br />
              <em className="italic font-light text-terracotta">the same care</em><br />
              it was made with.
            </h1>
          </div>
          <div className="lg:col-span-5 text-muted leading-relaxed">
            <p>
              Every LVY piece is hand-finished in our studio and then placed into your home by a crew we train ourselves.
              Enter your postal code below for a live delivery estimate — or jump to any section.
            </p>
          </div>
        </div>
      </section>

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-16 container">
        {/* ═════ Sticky side nav ═════ */}
        <aside className="hidden lg:block">
          <nav className="sticky top-32 space-y-1 border-l border-charcoal/10 pl-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta mb-4">On this page</p>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`block text-xs uppercase tracking-[0.2em] py-2 transition ${
                  activeSection === s.id ? "text-charcoal font-semibold" : "text-muted hover:text-charcoal"
                }`}
              >
                {activeSection === s.id && <span className="inline-block w-4 h-px bg-terracotta mr-2 align-middle" />}
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="lg:col-start-2">
          {/* ═════ #1 Interactive estimator ═════ */}
          <section id="estimator" className="py-12 lg:py-16 scroll-mt-32">
            <div className="border-2 border-charcoal relative overflow-hidden bg-cream">
              <div className="absolute top-0 right-0 bg-terracotta text-cream text-[10px] uppercase tracking-[0.3em] px-4 py-2">
                Live estimate
              </div>
              <div className="p-8 lg:p-10">
                <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-4 flex items-center gap-3">
                  <Sparkles size={12} /> Shipping estimator
                </p>
                <h2 className="font-display text-3xl lg:text-4xl leading-tight mb-8">
                  Where should we<br />deliver your pieces?
                </h2>

                <div className="grid sm:grid-cols-5 gap-4 items-end mb-6">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Postal code</label>
                    <input
                      value={postal}
                      onChange={(e) => setPostal(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && getQuote()}
                      placeholder="10001"
                      className="w-full border-b-2 border-charcoal/30 focus:border-charcoal bg-transparent py-2 outline-none text-lg tabular-nums transition"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Order subtotal ($)</label>
                    <input
                      type="number"
                      value={subtotalInput}
                      onChange={(e) => setSubtotalInput(e.target.value)}
                      className="w-full border-b-2 border-charcoal/30 focus:border-charcoal bg-transparent py-2 outline-none text-lg tabular-nums transition"
                    />
                  </div>
                  <button
                    onClick={getQuote}
                    disabled={quoting}
                    className="btn btn-primary disabled:opacity-50 h-fit"
                  >
                    {quoting ? "Calculating…" : "Get estimate"}
                  </button>
                </div>

                {quoteError && <p className="text-sm text-terracotta mb-4">{quoteError}</p>}

                {quote && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-3 gap-3 pt-6 border-t border-charcoal/10"
                  >
                    {[
                      { label: "Standard", price: quote.standard, eta: quote.etaDays.standard },
                      { label: "Express", price: quote.express, eta: quote.etaDays.express },
                      { label: "White Glove", price: quote.whiteGlove, eta: quote.etaDays.whiteGlove },
                    ].map((r, i) => (
                      <motion.div
                        key={r.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="p-4 bg-sand/40"
                      >
                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted">{r.label}</p>
                        <p className="font-display text-2xl tabular-nums mt-1">
                          {r.price === 0 ? "Free" : `$${r.price}`}
                        </p>
                        <p className="text-xs text-muted mt-1">{r.eta} days</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {!quote && (
                  <p className="text-xs text-muted">
                    We calculate delivery fees by postal zone in real time. Your address is never stored.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ═════ #2 Tier cards ═════ */}
          <section id="tiers" className="py-12 lg:py-16 scroll-mt-32">
            <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta mb-4">Delivery tiers</p>
            <h2 className="font-display text-4xl lg:text-5xl leading-tight mb-10">Choose how you want it delivered.</h2>
            <div className="grid lg:grid-cols-3 gap-5">
              {TIERS.map((t, i) => {
                const Icon = t.icon;
                return (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={`p-8 border relative ${
                      t.highlight ? "bg-charcoal text-cream border-charcoal" : "bg-cream border-charcoal/10"
                    }`}
                  >
                    {t.highlight && (
                      <span className="absolute top-4 right-4 text-[9px] uppercase tracking-[0.3em] bg-terracotta text-cream px-2 py-1">
                        Signature
                      </span>
                    )}
                    <Icon size={26} className={t.highlight ? "text-terracotta" : "text-charcoal"} />
                    <p className="font-display text-3xl mt-6">{t.name}</p>
                    <p className={`text-[10px] uppercase tracking-[0.3em] mt-2 ${t.highlight ? "text-cream/60" : "text-muted"}`}>
                      {t.time}
                    </p>
                    <div className={`my-6 h-px ${t.highlight ? "bg-cream/15" : "bg-charcoal/10"}`} />
                    <p className="font-display text-2xl tabular-nums">{t.priceLabel}</p>
                    <p className={`text-sm mt-4 leading-relaxed ${t.highlight ? "text-cream/70" : "text-muted"}`}>
                      {t.note}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ═════ #2b Tier comparison table ═════ */}
          <section id="compare" className="py-12 lg:py-16 scroll-mt-32">
            <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta mb-4">Side by side</p>
            <h2 className="font-display text-4xl lg:text-5xl leading-tight mb-10">Compare every detail.</h2>
            <div className="overflow-x-auto border border-charcoal/10">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-sand/40">
                    <th className="text-left p-5 text-[10px] uppercase tracking-[0.2em] text-muted font-normal">Feature</th>
                    <th className="text-left p-5 font-display text-lg">Standard</th>
                    <th className="text-left p-5 font-display text-lg">Express</th>
                    <th className="text-left p-5 font-display text-lg text-terracotta">White Glove</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.label} className="border-t border-charcoal/10">
                      <td className="p-5 text-muted">{row.label}</td>
                      <td className="p-5"><CellValue v={row.standard} /></td>
                      <td className="p-5"><CellValue v={row.express} /></td>
                      <td className="p-5 bg-terracotta/5"><CellValue v={row.whiteGlove} highlight /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ═════ Timeline ═════ */}
          <section id="timeline" className="py-12 lg:py-16 scroll-mt-32 border-t border-charcoal/10">
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-4 flex items-center gap-3">
                  <span className="w-8 h-px bg-terracotta" /> Timeline
                </p>
                <h2 className="font-display text-4xl lg:text-5xl leading-[1.05] mb-6">
                  From atelier to<br />
                  <em className="italic font-light text-terracotta">your doorstep.</em>
                </h2>
                <p className="text-muted leading-relaxed">
                  We never rush a piece, but we don't waste your time either.
                </p>
              </div>

              <div className="lg:col-span-8">
                <ol className="relative border-l border-charcoal/15 ml-4">
                  {TIMELINE.map((step, i) => (
                    <motion.li
                      key={step.label}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="relative pl-10 pb-10 last:pb-0"
                    >
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-cream border-2 border-terracotta" />
                      <p className="text-[10px] uppercase tracking-[0.3em] text-terracotta tabular-nums">
                        Step {String(i + 1).padStart(2, "0")}
                      </p>
                      <p className="font-display text-2xl mt-1">{step.label}</p>
                      <p className="text-muted mt-2 max-w-lg">{step.body}</p>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* ═════ #4 Tracking preview + #7 Video placeholder ═════ */}
          <section id="tracking" className="py-12 lg:py-16 scroll-mt-32">
            <div className="grid lg:grid-cols-2 gap-8 items-stretch">
              {/* Tracking card */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta mb-4">What you'll see</p>
                <h2 className="font-display text-3xl lg:text-4xl leading-tight mb-6">Every step, in your account.</h2>
                <div className="bg-sand/40 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Order</p>
                      <p className="font-display text-xl mt-1 tabular-nums">LVY-PREVIEW-DEMO</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-terracotta">Out for delivery</span>
                  </div>
                  <div className="relative">
                    <div className="absolute top-3 left-0 right-0 h-0.5 bg-charcoal/15" />
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "80%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                      className="absolute top-3 left-0 h-0.5 bg-terracotta"
                    />
                    <div className="flex justify-between relative">
                      {TRACKING_STEPS.map((s, i) => (
                        <div key={s} className="flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              i < 4 ? "bg-terracotta" : "bg-cream border border-charcoal/20"
                            }`}
                          >
                            {i < 4 && <Check size={12} className="text-cream" />}
                          </div>
                          <span className="mt-2 text-[9px] uppercase tracking-wider text-muted text-center w-16">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* "Video" placeholder */}
              <div className="relative aspect-video lg:aspect-auto lg:min-h-full overflow-hidden bg-charcoal group cursor-pointer">
                <img
                  src="/dmitry-mashkin-QAmRmIvSZZM-unsplash.jpg"
                  alt="White glove delivery"
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-[800ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-cream">
                  <div className="w-20 h-20 rounded-full bg-cream/95 backdrop-blur flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                    <Play size={26} className="text-charcoal ml-1" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 text-cream">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-cream/70">Watch · 0:15</p>
                  <p className="font-display text-2xl mt-1">The white-glove arrival</p>
                </div>
              </div>
            </div>
          </section>

          {/* ═════ #3 + #6 Global reach + cities ═════ */}
          <section id="reach" className="py-16 lg:py-20 scroll-mt-32 -mx-6 px-6 lg:-mx-10 lg:px-10 bg-sand/30">
            <div className="grid lg:grid-cols-12 gap-10 mb-12">
              <div className="lg:col-span-5">
                <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-4 flex items-center gap-3">
                  <span className="w-8 h-px bg-terracotta" /> Global reach
                </p>
                <h2 className="font-display text-4xl lg:text-5xl leading-[1.05] mb-6">
                  48 countries.<br />
                  <em className="italic font-light text-terracotta">{totalCities} white-glove cities.</em>
                </h2>
                <p className="text-muted leading-relaxed mb-6">
                  Our signature service is live in {totalCities} cities across three continents.
                  For anywhere else in our 48 countries, we partner with the best local carriers.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "48", label: "Countries" },
                    { value: totalCities, label: "WG cities" },
                    { value: "3", label: "Continents" },
                  ].map((s) => (
                    <div key={s.label} className="bg-cream p-4 border border-charcoal/10">
                      <p className="font-display text-2xl tabular-nums">{s.value}</p>
                      <p className="text-[9px] uppercase tracking-[0.25em] text-muted mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stylized "map" — dotted constellation */}
              <div className="lg:col-span-7 relative min-h-[280px]">
                <svg viewBox="0 0 800 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#2b1f13" opacity="0.15" />
                    </pattern>
                  </defs>
                  <rect width="800" height="400" fill="url(#dots)" />
                  {/* City dots — roughly mapped */}
                  {[
                    { x: 180, y: 160, label: "NYC" },
                    { x: 130, y: 180, label: "LA" },
                    { x: 165, y: 155, label: "CHI" },
                    { x: 155, y: 200, label: "MIA" },
                    { x: 410, y: 140, label: "LON" },
                    { x: 420, y: 155, label: "PAR" },
                    { x: 445, y: 150, label: "BER" },
                    { x: 430, y: 170, label: "MIL" },
                    { x: 650, y: 180, label: "TYO" },
                    { x: 640, y: 250, label: "SIN" },
                    { x: 700, y: 290, label: "SYD" },
                    { x: 620, y: 220, label: "HKG" },
                  ].map((c, i) => (
                    <g key={c.label}>
                      <motion.circle
                        cx={c.x}
                        cy={c.y}
                        r="5"
                        fill="#b26f47"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                      />
                      <circle cx={c.x} cy={c.y} r="12" fill="#b26f47" opacity="0.2">
                        <animate attributeName="r" values="8;16;8" dur="3s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
                        <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
                      </circle>
                      <text x={c.x + 10} y={c.y + 4} fontSize="10" fill="#2b1f13" fontFamily="monospace">{c.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Cities grid */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta mb-6">White-glove cities</p>
              <div className="grid lg:grid-cols-3 gap-8">
                {Object.entries(WHITE_GLOVE_CITIES).map(([region, cities]) => (
                  <div key={region}>
                    <p className="font-display text-lg mb-3 border-b border-charcoal/10 pb-2">
                      {region} <span className="text-xs text-muted">({cities.length})</span>
                    </p>
                    <ul className="text-sm text-muted space-y-1.5">
                      {cities.map((c) => (
                        <li key={c} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-terracotta flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* #5 Carrier strip */}
              <div className="mt-12 pt-8 border-t border-charcoal/10">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-4 text-center">Delivered in partnership with</p>
                <div className="flex items-center justify-center gap-8 lg:gap-12 flex-wrap">
                  {CARRIERS.map((c, i) => (
                    <motion.span
                      key={c}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 0.5 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="font-display text-2xl lg:text-3xl text-charcoal hover:opacity-100 transition tracking-tight"
                    >
                      {c}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═════ Returns ═════ */}
          <section id="returns" className="py-16 lg:py-20 scroll-mt-32">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5">
                <RotateCcw size={24} className="text-terracotta mb-6" />
                <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-4 flex items-center gap-3">
                  <span className="w-8 h-px bg-terracotta" /> 30-day returns
                </p>
                <h2 className="font-display text-4xl lg:text-5xl leading-[1.05] mb-6">
                  Not the right fit?<br />
                  <em className="italic font-light text-terracotta">We make it easy.</em>
                </h2>
                <p className="text-muted leading-relaxed mb-8">
                  If your piece doesn't feel right in your space, send it back within 30 days.
                  We cover the pickup, inspect it, and refund the full amount.
                </p>
                <Link to="/shop" className="btn btn-primary">
                  Shop the collection <ArrowUpRight size={16} />
                </Link>
              </div>

              <div className="lg:col-span-7 space-y-4">
                {RETURN_STEPS.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 bg-cream p-5 border border-charcoal/10"
                  >
                    <span className="font-display text-2xl text-terracotta tabular-nums flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="leading-relaxed">{s}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ═════ #9 FAQ with search ═════ */}
          <section id="faq" className="py-16 lg:py-20 scroll-mt-32 border-t border-charcoal/10">
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-4 flex items-center gap-3">
                  <span className="w-8 h-px bg-terracotta" /> Questions
                </p>
                <h2 className="font-display text-4xl lg:text-5xl leading-[1.05] mb-6">
                  Frequently<br />
                  <em className="italic font-light text-terracotta">asked.</em>
                </h2>
                <p className="text-muted leading-relaxed mb-6">
                  Can't find what you're looking for? Our team usually replies within a few hours.
                </p>
                <a
                  href="mailto:support@lvy.shop"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] border-b border-charcoal pb-1"
                >
                  support@lvy.shop <ArrowUpRight size={12} />
                </a>
              </div>

              <div className="lg:col-span-8">
                {/* Search */}
                <div className="relative mb-6">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    value={faqQuery}
                    onChange={(e) => setFaqQuery(e.target.value)}
                    placeholder="Search the questions…"
                    className="w-full pl-11 pr-10 py-4 border-2 border-charcoal/15 bg-cream outline-none focus:border-charcoal transition"
                  />
                  {faqQuery && (
                    <button onClick={() => setFaqQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal">
                      <X size={16} />
                    </button>
                  )}
                </div>

                {filteredFaq.length === 0 ? (
                  <p className="text-muted italic py-6">No matches — try different words or email us directly.</p>
                ) : (
                  filteredFaq.map((f, i) => (
                    <motion.details
                      key={f.q}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="group border-b border-charcoal/10 py-6 cursor-pointer"
                    >
                      <summary className="flex items-start justify-between gap-6 list-none">
                        <p className="font-display text-xl lg:text-2xl group-hover:text-terracotta transition pr-4">
                          {f.q}
                        </p>
                        <ChevronDown size={20} className="text-terracotta flex-shrink-0 group-open:rotate-180 transition duration-300" />
                      </summary>
                      <p className="mt-4 text-muted leading-relaxed max-w-2xl">{f.a}</p>
                    </motion.details>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* ═════ CTA strip ═════ */}
          <section className="-mx-6 lg:-mx-10 bg-charcoal text-cream">
            <div className="py-16 lg:py-20 px-6 lg:px-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div>
                <Check size={20} className="text-terracotta mb-4" />
                <h2 className="font-display text-4xl lg:text-5xl leading-[1.05] max-w-2xl">
                  Still have questions about a specific piece?
                </h2>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <a href="mailto:support@lvy.shop" className="btn btn-primary bg-terracotta hover:bg-terracotta/90">
                  Email our team <ArrowUpRight size={16} />
                </a>
                <Link to="/shop" className="btn btn-outline border-cream/30 text-cream hover:bg-cream hover:text-charcoal">
                  Browse shop
                </Link>
              </div>
            </div>
          </section>

          {/* #10 Last updated */}
          <div className="py-8 text-center text-[10px] uppercase tracking-[0.3em] text-muted">
            Policy last updated April 2026 · v2.1
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CellValue({ v, highlight = false }: { v: string | boolean; highlight?: boolean }) {
  if (typeof v === "boolean") {
    return v ? (
      <Check size={16} className={highlight ? "text-terracotta" : "text-sage"} />
    ) : (
      <span className="text-charcoal/20">—</span>
    );
  }
  return <span className={highlight ? "text-charcoal font-medium" : ""}>{v}</span>;
}
