import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { LvyLogo } from "@/components/brand/LvyLogo";
import { ChevronRight, Leaf, Shield, Truck, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const HERO_IMAGES = [
  "/toa-heftiba-LE3UlRqIFR0-unsplash.jpg",
  "/ceyda-ciftci-JO5Y80Fajjo-unsplash.jpg",
  "/toa-heftiba-GyG8thVBInw-unsplash.jpg",
  "/dmitry-mashkin-QAmRmIvSZZM-unsplash.jpg",
];

const TRUST_MARKS = [
  { icon: Award, label: "Hand-Knotted" },
  { icon: Leaf, label: "Natural Fibres" },
  { icon: Sparkles, label: "Made in Small Batches" },
  { icon: Leaf, label: "Cotton · Jute · Linen" },
  { icon: Award, label: "Made with Care" },
  { icon: Shield, label: "Made to Order" },
  { icon: Truck, label: "Carbon-Neutral Shipping" },
  { icon: Sparkles, label: "Quietly Crafted" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroSection5({ data }: { data?: any }) {
  const [imgIdx] = useState(() => Math.floor(Math.random() * HERO_IMAGES.length));

  const eyebrow = data?.eyebrow ?? "Handcrafted Macramé · New Collection";
  const title = data?.title ?? "Crafted for calm,";
  const titleAccent = data?.titleAccent ?? "made to belong.";
  const body =
    data?.body ??
    "Handcrafted macramé that brings softness and balance into modern spaces — where design is not loud, but deeply felt. Made by hand, in small batches, from natural fibres.";
  const ctaPrimary = data?.ctaPrimary ?? { label: "Shop the Collection", to: "/shop" };
  const ctaSecondary = data?.ctaSecondary ?? { label: "Our Story", to: "/about" };
  const images = data?.images?.length ? data.images : HERO_IMAGES;
  const heroImage = images[imgIdx % images.length];

  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Soft paper texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="container relative grid items-center gap-12 pt-28 pb-16 lg:grid-cols-12 lg:gap-10 lg:pt-36 lg:pb-24">
        {/* ── Copy ── */}
        <div className="order-2 lg:order-1 lg:col-span-6 lg:pr-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-terracotta"
          >
            <LvyLogo decorative className="h-3.5 w-auto text-terracotta" />
            <span aria-hidden className="h-px w-8 bg-terracotta/50" />
            {eyebrow}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.9, ease: EASE }}
            className="mt-7 font-display text-[clamp(2.75rem,6.5vw,5.5rem)] leading-[0.95] tracking-tightest text-charcoal"
          >
            {title}
            <br />
            <em className="font-light italic text-terracotta">{titleAccent}</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.8, ease: EASE }}
            className="mt-8 max-w-md text-lg leading-relaxed text-stone"
          >
            {body}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.8, ease: EASE }}
            className="mt-10 flex flex-col items-start gap-x-6 gap-y-4 sm:flex-row sm:items-center"
          >
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-terracotta pl-7 pr-5 text-sm uppercase tracking-[0.18em] text-cream hover:bg-walnut"
            >
              <Link to={ctaPrimary.to}>
                <span className="text-nowrap">{ctaPrimary.label}</span>
                <ChevronRight className="ml-1" size={16} />
              </Link>
            </Button>
            <Link
              to={ctaSecondary.to}
              className="link-underline pb-0.5 text-xs uppercase tracking-[0.3em] text-charcoal/70 transition hover:text-charcoal"
            >
              {ctaSecondary.label}
            </Link>
          </motion.div>
        </div>

        {/* ── Arch portrait ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 1, ease: EASE }}
          className="relative order-1 mx-auto w-full max-w-md lg:order-2 lg:col-span-6 lg:max-w-none lg:pl-6"
        >
          <div className="relative mx-auto aspect-[3/4] w-[88%] sm:w-[78%] lg:w-[84%]">
            {/* Offset sand arch behind */}
            <div
              aria-hidden
              className="absolute -left-5 -top-5 h-full w-full rounded-t-full bg-sand lg:-left-7 lg:-top-7"
            />
            {/* Hairline arch outline */}
            <div
              aria-hidden
              className="absolute -right-4 bottom-6 h-[94%] w-full rounded-t-full border border-terracotta/30"
            />
            {/* Image */}
            <div className="absolute inset-0 overflow-hidden rounded-t-full border border-charcoal/10 shadow-md">
              <motion.img
                initial={{ scale: 1.06 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.6, ease: EASE }}
                src={heroImage}
                alt="Handcrafted LVY macramé styled in a calm, sunlit interior"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Caption stamp */}
            <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap bg-charcoal px-4 py-2 text-cream shadow-md">
              <LvyLogo decorative className="h-3 w-auto text-cream" />
              <span className="text-[10px] uppercase tracking-[0.3em]">Handcrafted · 2026</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Quiet value marquee ── */}
      <div className="relative border-y border-charcoal/10 bg-cream/60">
        <div className="container">
          <div className="flex flex-col items-center md:flex-row">
            <div className="hidden md:block md:max-w-[11rem] md:border-r md:border-charcoal/10 md:pr-6">
              <p className="text-end text-[10px] uppercase tracking-[0.3em] text-stone">
                Honest materials, made by hand
              </p>
            </div>
            <div className="relative w-full py-5 md:w-[calc(100%-11rem)] md:pl-6">
              <InfiniteSlider speedOnHover={20} speed={45} gap={72}>
                {TRUST_MARKS.map((mark, i) => {
                  const Icon = mark.icon;
                  return (
                    <div key={i} className="flex items-center gap-2 text-charcoal/55">
                      <Icon size={15} className="text-terracotta/70" />
                      <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.25em]">
                        {mark.label}
                      </span>
                    </div>
                  );
                })}
              </InfiniteSlider>
              <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-cream to-transparent" />
              <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-cream to-transparent" />
              <ProgressiveBlur className="pointer-events-none absolute left-0 top-0 h-full w-16" direction="left" blurIntensity={1} />
              <ProgressiveBlur className="pointer-events-none absolute right-0 top-0 h-full w-16" direction="right" blurIntensity={1} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
