import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { cn } from "@/lib/cn";
import { ChevronRight, Leaf, Shield, Truck, Award, Sparkles } from "lucide-react";
import { useScroll, motion } from "framer-motion";
import React from "react";

const HERO_IMAGES = [
  "/toa-heftiba-LE3UlRqIFR0-unsplash.jpg",
  "/ceyda-ciftci-JO5Y80Fajjo-unsplash.jpg",
  "/toa-heftiba-GyG8thVBInw-unsplash.jpg",
  "/dmitry-mashkin-QAmRmIvSZZM-unsplash.jpg",
];

const TRUST_MARKS = [
  { icon: Leaf, label: "FSC Certified" },
  { icon: Shield, label: "5-Year Warranty" },
  { icon: Truck, label: "White Glove Delivery" },
  { icon: Award, label: "Handcrafted" },
  { icon: Sparkles, label: "Sustainable Materials" },
  { icon: Leaf, label: "Small Batch" },
  { icon: Shield, label: "30-Day Returns" },
  { icon: Truck, label: "48 Countries" },
];

export default function HeroSection5({ data }: { data?: any }) {
  const [imgIdx] = useState(() => Math.floor(Math.random() * HERO_IMAGES.length));

  const eyebrow = data?.eyebrow ?? "Spring Collection · 2026";
  const title = data?.title ?? "Furniture you can";
  const titleAccent = data?.titleAccent ?? "turn around.";
  const body =
    data?.body ??
    "Drag, spin, and live with every piece in 3D before it lives with you. Hand-crafted in our studio — delivered with care.";
  const ctaPrimary = data?.ctaPrimary ?? { label: "Shop Collection", to: "/shop" };
  const ctaSecondary = data?.ctaSecondary ?? { label: "Our Story", to: "/about" };
  const images = data?.images?.length ? data.images : HERO_IMAGES;

  return (
    <main className="overflow-x-hidden">
      <section>
        <div className="py-24 md:pb-32 lg:pb-36 lg:pt-44">
          <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
            <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="text-xs uppercase tracking-[0.4em] text-terracotta flex items-center gap-3 justify-center lg:justify-start"
              >
                <span className="w-8 h-px bg-terracotta" />
                {eyebrow}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 1 }}
                className="mt-8 max-w-2xl text-balance font-display text-5xl md:text-6xl lg:mt-10 xl:text-7xl leading-[0.92] tracking-tightest"
              >
                {title}<br />
                <em className="italic font-light text-terracotta">{titleAccent}</em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-8 max-w-2xl text-balance text-lg text-muted leading-relaxed"
              >
                {body}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
              >
                <Button asChild size="lg" className="h-12 rounded-full pl-6 pr-4 text-base bg-charcoal text-cream hover:bg-walnut">
                  <Link to={ctaPrimary.to}>
                    <span className="text-nowrap">{ctaPrimary.label}</span>
                    <ChevronRight className="ml-1" size={18} />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-12 rounded-full px-6 text-base hover:bg-sand/60"
                >
                  <Link to={ctaSecondary.to}>
                    <span className="text-nowrap">{ctaSecondary.label}</span>
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Background image instead of video */}
          <div className="absolute inset-1 overflow-hidden rounded-3xl border border-charcoal/10 lg:rounded-[3rem] aspect-[2/3] sm:aspect-video">
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
              src={images[imgIdx]}
              alt="LVY Furniture"
              className="size-full object-cover opacity-30 lg:opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/80 to-cream/30 lg:from-cream lg:via-cream/70 lg:to-transparent" />
          </div>
        </div>
      </section>

      {/* Trust marks slider — replaces the SaaS logos */}
      <section className="bg-cream pb-2">
        <div className="group relative m-auto max-w-7xl px-6">
          <div className="flex flex-col items-center md:flex-row">
            <div className="md:max-w-44 md:border-r md:border-charcoal/10 md:pr-6">
              <p className="text-end text-xs uppercase tracking-[0.25em] text-muted">Built with intent</p>
            </div>
            <div className="relative py-6 md:w-[calc(100%-11rem)]">
              <InfiniteSlider speedOnHover={20} speed={40} gap={80}>
                {TRUST_MARKS.map((mark, i) => {
                  const Icon = mark.icon;
                  return (
                    <div key={i} className="flex items-center gap-2 text-charcoal/60">
                      <Icon size={16} />
                      <span className="text-xs uppercase tracking-[0.2em] whitespace-nowrap">{mark.label}</span>
                    </div>
                  );
                })}
              </InfiniteSlider>

              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-cream to-transparent" />
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-cream to-transparent" />
              <ProgressiveBlur
                className="pointer-events-none absolute left-0 top-0 h-full w-20"
                direction="left"
                blurIntensity={1}
              />
              <ProgressiveBlur
                className="pointer-events-none absolute right-0 top-0 h-full w-20"
                direction="right"
                blurIntensity={1}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
