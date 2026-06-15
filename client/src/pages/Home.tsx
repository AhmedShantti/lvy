import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Hero from "@/components/sections/Hero";
import HeroSection5 from "@/components/sections/HeroSection5";
import ScrollScene from "@/components/sections/ScrollScene";
import CategoryGrid from "@/components/sections/CategoryGrid";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import FeaturedShowcase from "@/components/sections/FeaturedShowcase";
import Story from "@/components/sections/Story";
import Testimonials from "@/components/sections/Testimonials";
import CtaSection from "@/components/sections/CtaSection";

const SECTION_COMPONENTS: Record<string, any> = {
  hero: HeroSection5,
  heroClassic: Hero,
  scrollScene: ScrollScene,
  featured: FeaturedShowcase,
  featuredClassic: FeaturedProducts,
  categoryGrid: CategoryGrid,
  story: Story,
  testimonials: Testimonials,
  cta: CtaSection,
};

// Fallback section order when DB is unreachable
const FALLBACK = [
  { id: "f1", type: "hero", data: null },
  { id: "f2", type: "scrollScene", data: null },
  { id: "f3", type: "featured", data: null },
  { id: "f4", type: "categoryGrid", data: null },
  { id: "f5", type: "story", data: null },
  { id: "f6", type: "testimonials", data: null },
  { id: "f7", type: "cta", data: null },
];

export default function Home() {
  const { data } = useQuery({
    queryKey: ["content-home"],
    queryFn: async () => (await api.get("/content/home")).data,
    retry: false,
  });

  const sections = data?.page?.sections ?? FALLBACK;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {sections.map((s: any) => {
        const Component = SECTION_COMPONENTS[s.type];
        if (!Component) return null;
        return <Component key={s.id} data={s.data} />;
      })}
    </motion.div>
  );
}
