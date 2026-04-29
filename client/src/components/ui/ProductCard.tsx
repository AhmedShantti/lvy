import { Link } from "react-router-dom";

export default function ProductCard({ product }: { product: any }) {
  return (
    <Link to={`/product/${product.slug}`} className="product-card block">
      <div className="aspect-[4/5] overflow-hidden bg-sand/40">
        <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="mt-4 flex justify-between items-start">
        <div>
          <h3 className="font-display text-lg leading-tight">{product.name}</h3>
          <p className="text-xs text-muted mt-1 uppercase tracking-wider">{product.material}</p>
        </div>
        <div className="font-display text-lg">${Number(product.price).toLocaleString()}</div>
      </div>
    </Link>
  );
}
