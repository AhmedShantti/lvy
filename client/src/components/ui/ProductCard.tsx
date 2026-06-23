import { Link } from "react-router-dom";

/**
 * Canonical boutique product card — matches the Home design language:
 * subtle arch-topped image, serif name, terracotta price, quiet badges.
 * Behaviour/props unchanged; hover scale comes from the global `.product-card` rule.
 */
export default function ProductCard({ product }: { product: any }) {
  const price = Number(product.price);
  const compareAt = product.compareAt != null ? Number(product.compareAt) : null;
  const onSale = compareAt != null && compareAt > price;

  return (
    <Link to={`/product/${product.slug}`} className="product-card group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-[2rem] border border-charcoal/10 bg-sand/40">
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {(product.isNew || onSale) && (
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-charcoal px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-cream">New</span>
            )}
            {onSale && (
              <span className="bg-terracotta px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-cream">Sale</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg leading-tight">{product.name}</h3>
          {product.material && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone">{product.material}</p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-baseline gap-2">
          <p className="font-display text-lg tabular-nums text-terracotta">EGP {price.toLocaleString()}</p>
          {onSale && (
            <p className="text-xs tabular-nums text-stone line-through">EGP {compareAt!.toLocaleString()}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
