import Image from "next/image";
import { ArrowLeft, ArrowRight, ReceiptText } from "lucide-react";
import type { CartItem } from "@/lib/types";
import { calculateSubtotal, formatPeso } from "@/lib/utils";

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
  onBack: () => void;
  onContinue: () => void;
}

export default function OrderSummary({ items, total, onBack, onContinue }: OrderSummaryProps) {
  return (
    <div data-testid="screen-summary" className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Order Summary</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">Review your order before paying.</p>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li
                key={item.product.id}
                data-testid={`summary-item-${item.product.id}`}
                className="flex items-center justify-between gap-3 px-6 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={512}
                    height={382}
                    className="h-11 w-11 flex-none rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-800">{item.product.name}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {item.quantity} × {formatPeso(item.product.price)}
                    </p>
                  </div>
                </div>
                <p className="font-extrabold text-brand-800">
                  {formatPeso(calculateSubtotal(item))}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <span className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ReceiptText className="h-5 w-5 text-brand-700" aria-hidden="true" />
              Total
            </span>
            <span className="text-2xl font-black text-brand-800" data-testid="summary-total">
              {formatPeso(total)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            data-testid="back-button"
            onClick={onBack}
            className="touch-ripple flex h-16 select-none items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-xl font-extrabold text-slate-700 shadow-xs transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-6 w-6" aria-hidden="true" />
            Back
          </button>
          <button
            type="button"
            data-testid="summary-continue"
            onClick={onContinue}
            className="touch-ripple flex h-16 select-none items-center justify-center gap-3 rounded-2xl bg-brand-600 text-xl font-extrabold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
          >
            Continue to Payment
            <ArrowRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
