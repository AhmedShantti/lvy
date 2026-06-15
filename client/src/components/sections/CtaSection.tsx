import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LvyLogo } from "@/components/brand/LvyLogo";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CtaSection({ data }: { data?: any }) {
  const eyebrow = data?.eyebrow ?? "Made by hand, felt by soul";
  const title = data?.title ?? "Elevate your space.";
  const body =
    data?.body ??
    "Bring a quiet, handcrafted calm into the room you love most — one knot, one natural fibre, one intentional piece at a time.";
  const ctaPrimary = data?.ctaPrimary ?? { label: "Shop the Collection", to: "/shop" };
  const ctaSecondary = data?.ctaSecondary ?? { label: "Our Story", to: "/about" };

  return (
    <section className="relative overflow-hidden bg-terracotta text-cream">
      {/* Decorative arch outline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-12 h-[80%] w-[min(34rem,80%)] -translate-x-1/2 rounded-t-full border border-cream/15"
      />
      {/* Soft texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: EASE }}
        className="container relative flex flex-col items-center py-24 text-center lg:py-36"
      >
        <LvyLogo className="h-10 w-auto text-cream lg:h-12" title="LVY" />

        <p className="mt-8 text-[11px] uppercase tracking-[0.3em] text-cream/70">{eyebrow}</p>

        <h2 className="mt-5 max-w-3xl font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.98] tracking-tightest">
          {title}
        </h2>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/80">{body}</p>

        <div className="mt-10 flex flex-col items-center gap-x-6 gap-y-4 sm:flex-row">
          <Link
            to={ctaPrimary.to}
            className="btn group rounded-full bg-cream px-7 text-sm uppercase tracking-[0.18em] text-charcoal hover:bg-sand"
          >
            {ctaPrimary.label}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to={ctaSecondary.to}
            className="link-underline pb-0.5 text-xs uppercase tracking-[0.3em] text-cream/80 hover:text-cream"
          >
            {ctaSecondary.label}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
