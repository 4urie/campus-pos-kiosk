import Image from "next/image";
import { Check, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPeso } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  /** Current quantity of this product in the cart (shown as a badge). */
  quantity: number;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, quantity, onAdd }: ProductCardProps) {
  const isAdded = quantity > 0;
  return (
    <button
      type="button"
      data-testid={`product-card-${product.id}`}
      onClick={() => onAdd(product)}
      className={`touch-ripple group relative flex flex-col justify-between rounded-2xl bg-white p-4 text-left transition ${
        isAdded
          ? "border-2 border-brand-500 shadow-md hover:shadow-lg"
          : "border border-slate-200/90 shadow-sm hover:border-brand-300 hover:shadow-md"
      }`}
    >
      {/* Active quantity badge */}
      {isAdded && (
        <span className="absolute -right-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-xs font-bold text-white shadow-md ring-2 ring-brand-500">
          {quantity}
        </span>
      )}

      {/* Top tags */}
      <span className="mb-2 flex items-center justify-between">
        {product.badge && (
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${product.badge.className}`}
          >
            {product.badge.label}
          </span>
        )}
        {product.meta && (
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${product.meta.className}`}>
            {product.meta.label}
          </span>
        )}
      </span>

      {/* Product photo */}
      <Image
        src={product.image}
        alt={product.name}
        width={512}
        height={382}
        className="mb-3 h-32 w-full rounded-xl object-cover"
      />

      {/* Information */}
      <span className="mt-2 block">
        <span className="block font-bold leading-snug text-slate-800">{product.name}</span>
        <span className="block text-xs text-slate-500">{product.description}</span>
      </span>

      {/* Price & action */}
      <span className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3">
        <span>
          <span className="block text-xs font-medium text-slate-400">Price</span>
          <span className="text-lg font-black text-brand-800">{formatPeso(product.price)}</span>
        </span>
        <span
          className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            isAdded
              ? "bg-brand-600 text-white shadow-sm group-hover:bg-brand-700"
              : "border border-brand-200 bg-emerald-50 text-brand-800 group-hover:bg-brand-600 group-hover:text-white"
          }`}
        >
          {isAdded ? (
            <>
              <span>Added</span>
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
              <span>Add</span>
            </>
          )}
        </span>
      </span>
    </button>
  );
}
