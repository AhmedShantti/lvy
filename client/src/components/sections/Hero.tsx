import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LvyLogo } from "@/components/brand/LvyLogo";

const DEFAULT_HERO_IMAGES = [
  "/toa-heftiba-LE3UlRqIFR0-unsplash.jpg",
  "/ceyda-ciftci-JO5Y80Fajjo-unsplash.jpg",
  "/toa-heftiba-GyG8thVBInw-unsplash.jpg",
  "/dmitry-mashkin-QAmRmIvSZZM-unsplash.jpg",
];

export default function Hero({ data }: { data?: any }) {
  const images = (data?.images && data.images.length > 0) ? data.images : DEFAULT_HERO_IMAGES;
  const eyebrow = data?.eyebrow ?? "Handcrafted Macramé · New Collection";
  const title = data?.title ?? "Crafted for calm,";
  const titleAccent = data?.titleAccent ?? "made to belong.";
  const body = data?.body ?? "Handcrafted macramé that brings softness and balance into modern spaces — where design is not loud, but deeply felt. Made by hand, in small batches, from natural fibres.";
  const ctaPrimary = data?.ctaPrimary ?? { label: "Shop the Collection", to: "/shop" };
  const ctaSecondary = data?.ctaSecondary ?? { label: "Our Story", to: "/about" };
  const featured = data?.featured ?? { label: "Luna Wall Hanging", price: "$180" };

  const [heroIndex] = useState(() => Math.floor(Math.random() * images.length));
  const heroImage = images[heroIndex];
  const indexLabel = String(heroIndex + 1).padStart(2, "0");
  const totalLabel = String(images.length).padStart(2, "0");

  return (
    <section className="relative bg-cream overflow-hidden">
      {/* subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="container relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[88vh] py-16">
        {/* Left: copy */}
        <div className="relative z-10 order-2 lg:order-1">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-[11px] uppercase tracking-[0.3em] text-terracotta mb-6 flex items-center gap-3"
          >
            <LvyLogo decorative className="h-3 w-auto text-terracotta" />
            <span aria-hidden className="w-8 h-px bg-terracotta/50" />
            {eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="font-display text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-tightest"
          >
            {title.split(" ").map((w: string, i: number) => (
              <span key={i}>{w}{i < title.split(" ").length - 1 ? <br /> : null} </span>
            ))}
            <em className="italic font-light text-terracotta">{titleAccent}</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-8 max-w-md text-muted leading-relaxed"
          >
            {body}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link to={ctaPrimary.to} className="btn btn-primary group">
              {ctaPrimary.label}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to={ctaSecondary.to} className="btn btn-outline">{ctaSecondary.label}</Link>
          </motion.div>
        </div>

        {/* Right: editorial diptych */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-1 lg:order-2 h-[60vh] lg:h-[82vh]"
        >
          {/* Terracotta block sitting behind, offset bottom-left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 bottom-0 w-[68%] h-[78%] rounded-t-full bg-terracotta/90"
          />

          {/* Hairline grid marker — top-left corner of the terracotta block */}
          <div className="absolute left-0 top-[22%] w-12 h-px bg-charcoal/40" />
          <div className="absolute left-0 top-[22%] h-12 w-px bg-charcoal/40" />

          {/* Image card — portrait, offset top-right, casts a soft shadow */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 w-[72%] h-[88%] overflow-hidden rounded-t-full border border-charcoal/10 shadow-md"
          >
            <img
              src={heroImage}
              alt="Handcrafted LVY macramé in a calm, sunlit interior"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* gentle top-down vignette so corner labels read */}
            <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-transparent to-charcoal/40" />

            {/* Serif counter inside the arch (kept clear of rounded top corners) */}
            <div className="absolute top-[9%] left-1/2 -translate-x-1/2 text-center text-cream pointer-events-none">
              <p className="font-display text-2xl leading-none tabular-nums">
                {indexLabel}
                <span className="text-cream/50 text-base"> / {totalLabel}</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-cream/80 mt-2">
                Handcrafted · 2026
              </p>
            </div>

            {/* Bottom info — featured piece */}
            <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end text-cream pointer-events-none">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-cream/70">Featured</p>
                <p className="font-display text-xl mt-1">{featured.label}</p>
              </div>
              <p className="font-display text-xl tabular-nums">{featured.price}</p>
            </div>
          </motion.div>

          {/* Vertical serif "label spine" running up the right edge */}
          <div className="absolute right-0 top-[12%] bottom-[12%] w-px bg-charcoal/20 hidden lg:block" />
          <p className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.4em] text-muted hidden lg:block [writing-mode:vertical-rl] rotate-180">
            Lvy Editorial — N° {indexLabel}
          </p>
        </motion.div>
      </div>
    </section>
  );
}