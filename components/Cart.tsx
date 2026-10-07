import Image from "next/image";
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingCart, TicketPercent, Trash2 } from "lucide-react";
import type { CartItem } from "@/lib/types";
import { calculateSubtotal, formatPeso } from "@/lib/utils";

interface CartProps {
  items: CartItem[];
  total: number;
  onIncrease: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onNotify: (message: string) => void;
  onContinue: () => void;
}

export default function Cart({
  items,
  total,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
  onNotify,
  onContinue,
}: CartProps) {
  const isEmpty = items.length === 0;

  return (
    <aside
      data-testid="cart-panel"
      className="flex w-full flex-none flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl lg:w-96"
    >
      {/* Cart header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
            <ShoppingCart className="h-6 w-6 text-brand-700" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold leading-tight text-slate-800">Current Order</h2>
            <p className="text-xs font-medium text-slate-500">
              {items.length} item{items.length === 1 ? "" : "s"} selected
            </p>
          </div>
        </div>
        <button
          type="button"
          data-testid="clear-cart"
          onClick={onClear}
          disabled={isEmpty}
          title="Clear entire order"
          className="p-1.5 text-xs font-semibold text-rose-600 transition hover:text-rose-700 hover:underline disabled:opacity-40 disabled:hover:no-underline"
        >
          Clear
        </button>
      </div>

      {/* Itemized cart list + loyalty banner */}
      <div className="max-h-80 flex-1 space-y-3 overflow-y-auto p-4 lg:max-h-none lg:min-h-0">
        {isEmpty ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm font-medium leading-relaxed text-slate-500">
            Your cart is empty.
            <br />
            Tap a product to add it.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => {
              const subtotal = calculateSubtotal(item);
              return (
                <li
                  key={item.product.id}
                  data-testid={`cart-item-${item.product.id}`}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={512}
                        height={382}
                        className="h-10 w-10 flex-none rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-bold leading-tight text-slate-800">
                          {item.product.name}
                        </h4>
                        <span className="text-xs font-medium text-slate-500">
                          {formatPeso(item.product.price)} each
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-base font-black text-brand-800"
                      data-testid={`item-subtotal-${item.product.id}`}
                    >
                      {formatPeso(subtotal)}
                    </span>
                  </div>
                  {/* Quantity stepper & delete */}
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-inner">
                      <button
                        type="button"
                        data-testid={`qty-dec-${item.product.id}`}
                        onClick={() => onDecrease(item.product.id)}
                        disabled={item.quantity <= 1}
                        aria-label={`Decrease ${item.product.name} quantity`}
                        className="touch-ripple flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100"
                      >
                        <Minus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                      </button>
                      <span
                        className="w-9 text-center text-sm font-bold text-slate-800"
                        data-testid={`qty-${item.product.id}`}
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        data-testid={`qty-inc-${item.product.id}`}
                        onClick={() => onIncrease(item.product.id)}
                        aria-label={`Increase ${item.product.name} quantity`}
                        className="touch-ripple flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm transition hover:bg-brand-700"
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      data-testid={`remove-${item.product.id}`}
                      onClick={() => onRemove(item.product.id)}
                      title="Remove item"
                      aria-label={`Remove ${item.product.name}`}
                      className="touch-ripple rounded-xl border border-rose-100 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Student ID discount banner / loyalty */}
        <div className="flex items-center justify-between rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-3 text-xs">
          <div className="flex items-center gap-2">
            <TicketPercent className="h-5 w-5 text-brand-600" aria-hidden="true" />
            <span className="font-medium text-slate-700">Scan Student ID for 10% off</span>
          </div>
          <button
            type="button"
            onClick={() => onNotify("Student ID scanning is not available in this demo")}
            className="rounded-lg border border-emerald-200 bg-white px-2 py-1 font-bold text-brand-700 shadow-xs transition hover:text-brand-900"
          >
            Scan
          </button>
        </div>
      </div>

      {/* Financial totals & checkout */}
      <div className="flex-none space-y-4 border-t border-slate-200 bg-slate-50 p-5">
        <div className="space-y-1.5 text-xs font-medium text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-slate-800">{formatPeso(total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Campus Tax (0%)</span>
            <span className="text-slate-800">₱0.00</span>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>Student Promo</span>
            <span>-₱0.00</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between border-t border-slate-200 pt-3">
          <span className="text-base font-bold text-slate-900">Total Due</span>
          <span
            className="text-2xl font-black tracking-tight text-brand-800"
            data-testid="cart-total"
          >
            {formatPeso(total)}
          </span>
        </div>
        {/* Primary touch action: continue to payment. Big tap target with
            the amount to pay inside the CTA so the action and its cost
            read as one hierarchy unit. */}
        <button
          type="button"
          data-testid="continue-to-payment"
          onClick={onContinue}
          aria-disabled={isEmpty}
          className={`touch-ripple flex h-[68px] w-full items-center justify-between gap-3 rounded-2xl px-5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40 ${
            isEmpty
              ? "bg-slate-200 text-slate-400"
              : "bg-brand-600 text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 active:bg-brand-800"
          }`}
        >
          <span className="flex items-center gap-2.5 text-lg font-extrabold tracking-wide">
            Continue to Payment
            <ArrowRight
              className={`h-5 w-5 ${isEmpty ? "text-slate-400" : "text-white/90"}`}
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </span>
          <span
            className={`flex-none rounded-xl px-3 py-1.5 text-base font-black tabular-nums ${
              isEmpty ? "bg-slate-300/70 text-slate-500" : "bg-white/20 text-white"
            }`}
          >
            {formatPeso(total)}
          </span>
        </button>
        {/* Payment method badges / microcopy */}
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          GCash, Maya, Debit/Credit Card, or Student Pay
        </p>
      </div>
    </aside>
  );
}
