import { motion } from "framer-motion";

export default function StorySection() {
  return (
    <section className="section">
      <div className="container grid lg:grid-cols-2 gap-16 items-center">
        <motion.img
          initial={{ opacity: 0, scale: 1.05 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200"
          alt="Workshop"
          className="aspect-[4/5] object-cover w-full"
        />
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-muted">Our story</span>
          <h2 className="font-display text-4xl md:text-6xl mt-6 leading-[1.05]">
            Made by hand, <em className="italic text-terracotta">made to stay.</em>
          </h2>
          <p className="mt-8 text-muted leading-relaxed">
            Every piece begins as a sketch in our studio and ends as something we'd happily live with for decades. We work with FSC-certified woods, natural fibres, and a small group of craftspeople who care as much as we do.
          </p>
          <a className="btn btn-outline mt-8">Visit the studio</a>
        </div>
      </div>
    </section>
  );
}
