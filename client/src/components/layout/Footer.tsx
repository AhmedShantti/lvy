import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Instagram, Twitter, Facebook, Youtube, ArrowUpRight, ArrowRight, MapPin, Check,
} from "lucide-react";

const SHOP_LINKS = [
  { to: "/shop", label: "All pieces" },
  { to: "/shop?category=living-room", label: "Living room" },
  { to: "/shop?category=bedroom", label: "Bedroom" },
  { to: "/shop?category=dining", label: "Dining" },
  { to: "/shop?category=outdoor", label: "Outdoor" },
  { to: "/shop?category=lighting", label: "Lighting" },
];

const STUDIO_LINKS = [
  { to: "/about", label: "Our story" },
  { to: "/about", label: "Atelier" },
  { to: "/about", label: "Craftsmanship" },
  { to: "/about", label: "Sustainability" },
  { to: "/about", label: "Journal" },
  { to: "/about", label: "Press" },
];

const HELP_LINKS = [
  { to: "/shipping", label: "Shipping" },
  { to: "/shipping", label: "Returns" },
  { to: "/shipping", label: "Warranty" },
  { to: "/account", label: "Track order" },
  { to: "/shipping", label: "FAQ" },
  { to: "mailto:support@lvy.shop", label: "Contact" },
];

const SOCIALS = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Youtube, label: "Youtube", href: "#" },
];

function useAtelierTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "America/New_York",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    update();
    const t = setInterval(update, 1000 * 30);
    return () => clearInterval(t);
  }, []);
  return time;
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const atelierTime = useAtelierTime();

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000);
    setEmail("");
  };

  return (
    <footer className="bg-charcoal text-cream mt-32 relative overflow-hidden">
      {/* ═════ Top marquee ticker ═════ */}
      <div className="border-b border-cream/10 py-5 overflow-hidden">
        <div className="flex items-center gap-16 whitespace-nowrap animate-[marquee_40s_linear_infinite]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16 text-[10px] uppercase tracking-[0.4em] text-cream/50">
              <span className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-terracotta" /> Hand-crafted in Brooklyn
              </span>
              <span className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-terracotta" /> Shipping to 48 countries
              </span>
              <span className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-terracotta" /> Made to outlive trends
              </span>
              <span className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-terracotta" /> 5-year warranty
              </span>
              <span className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-terracotta" /> White-glove delivery
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ═════ Newsletter editorial block ═════ */}
      <div className="container pt-20 lg:pt-28 pb-16">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-5 flex items-center gap-3">
              <span className="w-8 h-px bg-terracotta" /> The LVY Dispatch
            </p>
            <h2 className="font-display text-5xl lg:text-7xl leading-[0.9] tracking-tightest">
              First look at<br />
              <em className="italic font-light text-terracotta">every new piece.</em>
            </h2>
            <p className="text-cream/60 mt-6 max-w-md leading-relaxed">
              A letter from the atelier — new drops, behind-the-scenes craft, and early access
              before they go public. Once a month, never more.
            </p>
          </div>

          <div className="lg:col-span-5">
            <form onSubmit={subscribe} className="relative">
              <label className="text-[10px] uppercase tracking-[0.4em] text-cream/40 block mb-3">
                Join 24,000 readers
              </label>
              <div className="flex items-center border-b-2 border-cream/30 focus-within:border-terracotta transition pb-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="bg-transparent flex-1 py-3 outline-none text-lg placeholder:text-cream/30"
                />
                <button
                  type="submit"
                  className="text-xs uppercase tracking-[0.3em] text-cream hover:text-terracotta transition flex items-center gap-2 px-3"
                >
                  Subscribe <ArrowRight size={14} />
                </button>
              </div>
              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-xs uppercase tracking-[0.3em] text-terracotta flex items-center gap-2"
                >
                  <Check size={12} /> You're in. Watch your inbox.
                </motion.p>
              )}
              <p className="text-[10px] uppercase tracking-[0.3em] text-cream/30 mt-3">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ═════ Link columns + atelier card ═════ */}
      <div className="container grid lg:grid-cols-12 gap-10 lg:gap-16 pb-16 border-t border-cream/10 pt-16">
        <div className="lg:col-span-3">
          <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40 mb-5">Shop</p>
          <ul className="space-y-2.5">
            {SHOP_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-sm text-cream/80 hover:text-terracotta hover:translate-x-1 inline-block transition-all">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40 mb-5">Studio</p>
          <ul className="space-y-2.5">
            {STUDIO_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-sm text-cream/80 hover:text-terracotta hover:translate-x-1 inline-block transition-all">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40 mb-5">Help</p>
          <ul className="space-y-2.5">
            {HELP_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-sm text-cream/80 hover:text-terracotta hover:translate-x-1 inline-block transition-all">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Atelier card with live clock */}
        <div className="lg:col-span-4 border border-cream/10 p-6 bg-cream/[0.02]">
          <MapPin size={16} className="text-terracotta mb-4" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40 mb-3">The Atelier</p>
          <p className="font-display text-2xl leading-tight">
            184 Kent Avenue<br />
            Brooklyn, NY 11249
          </p>
          <div className="mt-6 pt-5 border-t border-cream/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-cream/60">
              <span className="uppercase tracking-wider">Open now</span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Mon–Sat · 10–18
              </span>
            </div>
            <div className="flex items-center justify-between text-cream/60">
              <span className="uppercase tracking-wider">Local time</span>
              <span className="tabular-nums font-display text-base text-cream">{atelierTime} EST</span>
            </div>
          </div>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-terracotta hover:gap-3 transition-all"
          >
            Visit by appointment <ArrowUpRight size={12} />
          </a>
        </div>
      </div>

      {/* ═════ Bottom bar (above the giant wordmark) ═════ */}
      <div className="container flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-8 border-t border-cream/10">
        <div className="flex items-center gap-8 text-[10px] uppercase tracking-[0.3em] text-cream/50">
          <span>© {new Date().getFullYear()} LVY</span>
          <button className="hover:text-cream transition">EN · USD</button>
          <Link to="#" className="hover:text-cream transition hidden sm:inline">Privacy</Link>
          <Link to="#" className="hover:text-cream transition hidden sm:inline">Terms</Link>
          <Link to="#" className="hover:text-cream transition hidden md:inline">Cookies</Link>
        </div>
        <div className="flex items-center gap-5">
          {SOCIALS.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="text-cream/50 hover:text-terracotta transition"
              >
                <Icon size={16} />
              </a>
            );
          })}
        </div>
      </div>

      {/* ═════ GIANT WORDMARK ═════ */}
      <div
        aria-hidden
        className="overflow-hidden leading-none select-none"
      >
        <motion.p
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(8rem,24vw,26rem)] text-center tracking-tightest leading-[0.8] text-cream/[0.08] -mb-[4vw] lg:-mb-[6vw] pb-0 pt-8"
        >
          lvy<span className="text-terracotta/30">®</span>
        </motion.p>
      </div>

      {/* Marquee keyframe — lives in globals via arbitrary class */}
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </footer>
  );
}
