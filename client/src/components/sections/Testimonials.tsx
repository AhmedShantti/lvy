const quotes = [
  { q: "The most beautiful sofa I've ever owned. Worth every penny.", a: "Hannah, Brooklyn" },
  { q: "White-glove delivery was flawless. They even moved my old couch out.", a: "Marcus, LA" },
  { q: "Feels like a family heirloom — already.", a: "Sofia, Lisbon" },
];

export default function Testimonials() {
  return (
    <section className="section bg-charcoal text-cream">
      <div className="container">
        <h2 className="font-display text-4xl md:text-6xl text-center mb-16">From the people who live with it.</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {quotes.map((t, i) => (
            <figure key={i} className="text-center">
              <blockquote className="font-display text-2xl leading-relaxed italic">"{t.q}"</blockquote>
              <figcaption className="mt-6 text-xs uppercase tracking-widest text-cream/60">{t.a}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
