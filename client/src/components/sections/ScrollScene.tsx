import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    image: "/toa-heftiba-LE3UlRqIFR0-unsplash.jpg",
    eyebrow: "Material",
    title: "Sheen wool,\nhand-tufted.",
    body: "Each piece is upholstered in a tightly woven wool sheen — finished by hand and treated with a natural water repellent.",
  },
  {
    image: "/ceyda-ciftci-JO5Y80Fajjo-unsplash.jpg",
    eyebrow: "Craft",
    title: "Joinery you\ncan feel.",
    body: "Solid oak frame, mortise-and-tenon joints, and a webbed suspension that lasts two decades — not two seasons.",
  },
  {
    image: "/toa-heftiba-GyG8thVBInw-unsplash.jpg",
    eyebrow: "Detail",
    title: "Every edge,\nconsidered.",
    body: "From hand-sanded surfaces to turned brass hardware — no shortcuts, no filler, nothing that wouldn't make the cut in our studio.",
  },
  {
    image: "/dmitry-mashkin-QAmRmIvSZZM-unsplash.jpg",
    eyebrow: "Delivery",
    title: "White glove,\nevery time.",
    body: "We bring it inside, place it where you want, assemble it, and remove the packaging. Available in 30+ cities.",
  },
];

export default function ScrollScene({ data: content }: { data?: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const eyebrow = content?.eyebrow ?? "Featured Piece";
  const title = content?.title ?? "The Sheen Lounge";
  const panels = content?.panels?.length ? content.panels : null;

  // Use CMS panels if available, merge with default images
  const slides = panels
    ? panels.map((p: any, i: number) => ({
        ...SLIDES[i % SLIDES.length],
        ...p,
        image: SLIDES[i % SLIDES.length]?.image ?? SLIDES[0].image,
      }))
    : SLIDES;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Horizontal translation: 0% → -(100% - one screen worth)
  const totalSlides = slides.length;
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(totalSlides - 1) * 100}%`]);

  // Header fades out as you start scrolling
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.1], [0, -40]);

  // Progress bar width
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Counter
  const activeIndex = useTransform(scrollYProgress, (v) =>
    Math.min(totalSlides - 1, Math.floor(v * totalSlides))
  );

  return (
    <section
      ref={ref}
      className="relative bg-charcoal"
      style={{ height: `${totalSlides * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Header — fades out on scroll */}
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          className="absolute top-10 left-0 right-0 z-30 pointer-events-none"
        >
          <div className="container flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-terracotta flex items-center gap-3">
                <span className="w-8 h-px bg-terracotta" /> {eyebrow}
              </p>
              <h2 className="font-display text-4xl lg:text-5xl text-cream mt-3 tracking-tightest">{title}</h2>
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cream/40 hidden md:block">
              Scroll to explore ↓
            </p>
          </div>
        </motion.div>

        {/* Horizontal sliding track */}
        <motion.div
          style={{ x }}
          className="flex h-full will-change-transform"
        >
          {slides.map((slide: any, i: number) => (
            <Slide key={i} slide={slide} index={i} total={totalSlides} scrollYProgress={scrollYProgress} />
          ))}
        </motion.div>

        {/* Bottom bar: progress + counter */}
        <div className="absolute bottom-0 left-0 right-0 z-30">
          {/* Progress */}
          <div className="h-px bg-cream/10">
            <motion.div
              style={{ width: progressWidth }}
              className="h-full bg-terracotta"
            />
          </div>

          <div className="container py-5 flex items-center justify-between">
            <motion.p className="font-display text-2xl text-cream tabular-nums">
              <SlideCounter progress={scrollYProgress} total={totalSlides} />
            </motion.p>
            <Link
              to="/shop"
              className="text-[10px] uppercase tracking-[0.3em] text-cream/50 hover:text-terracotta transition flex items-center gap-2"
            >
              View all pieces <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slide({
  slide,
  index,
  total,
  scrollYProgress,
}: {
  slide: any;
  index: number;
  total: number;
  scrollYProgress: any;
}) {
  const segmentSize = 1 / total;
  const start = index * segmentSize;
  const mid = start + segmentSize * 0.3;
  const end = start + segmentSize;

  // Each panel fades in then stays
  const textOpacity = useTransform(scrollYProgress, [start, mid, end - segmentSize * 0.1, end], [0, 1, 1, index < total - 1 ? 0 : 1]);
  const textY = useTransform(scrollYProgress, [start, mid], [60, 0]);

  // Slow parallax on the image (faster than the slide translation for depth)
  const imgScale = useTransform(scrollYProgress, [start, end], [1.15, 1]);

  return (
    <div className="relative flex-shrink-0 w-screen h-full">
      {/* Image */}
      <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient scrim for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/50 to-charcoal/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/30" />
      </motion.div>

      {/* Text overlay */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="absolute inset-0 z-20 flex items-center"
      >
        <div className="container">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.4em] text-terracotta mb-5 flex items-center gap-3">
              <span className="w-8 h-px bg-terracotta" />
              {slide.eyebrow}
            </p>
            <h3 className="font-display text-5xl lg:text-7xl text-cream leading-[0.95] tracking-tightest whitespace-pre-line">
              {slide.title}
            </h3>
            <p className="mt-6 text-cream/70 leading-relaxed max-w-md text-lg">
              {slide.body}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Slide number — right side, vertically centered */}
      <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-20 hidden md:block">
        <p className="font-display text-8xl lg:text-9xl text-cream/[0.06] leading-none tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}

function SlideCounter({ progress, total }: { progress: any; total: number }) {
  const display = useTransform(progress, (v: number) => {
    const idx = Math.min(total - 1, Math.floor(v * total));
    return `${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  });

  return <motion.span>{display}</motion.span>;
}
