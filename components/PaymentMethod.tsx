import { ArrowLeft, Banknote, CreditCard, QrCode, type LucideIcon } from "lucide-react";
import type { PaymentMethod as PaymentMethodType } from "@/lib/types";
import { formatPeso } from "@/lib/utils";

interface PaymentOption {
  id: PaymentMethodType;
  label: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
}

const OPTIONS: PaymentOption[] = [
  {
    id: "Cash",
    label: "Cash",
    description: "Pay with bills and coins",
    icon: Banknote,
    iconClass: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "QR Payment",
    label: "QR Payment",
    description: "Scan with your supported payment app",
    icon: QrCode,
    iconClass: "bg-violet-100 text-violet-700",
  },
  {
    id: "Credit/Debit Card",
    label: "Credit/Debit Card",
    description: "Tap, insert, or swipe your card",
    icon: CreditCard,
    iconClass: "bg-sky-100 text-sky-700",
  },
];

interface PaymentMethodProps {
  total: number;
  onSelect: (method: PaymentMethodType) => void;
  onBack: () => void;
}

export default function PaymentMethod({ total, onSelect, onBack }: PaymentMethodProps) {
  return (
    <div data-testid="screen-payment-method" className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Choose a Payment Method
        </h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">How would you like to pay?</p>

        <div className="mt-4 rounded-2xl border border-slate-200/90 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-lg font-extrabold text-slate-800">Amount due</span>
            <span className="text-2xl font-black text-brand-800">{formatPeso(total)}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              data-testid={`pay-option-${option.id.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              onClick={() => onSelect(option.id)}
              className="touch-ripple flex min-h-24 select-none items-center gap-5 rounded-2xl border border-slate-200/90 bg-white px-6 py-4 text-left shadow-sm transition-all duration-100 hover:border-brand-300 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
            >
              <span
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${option.iconClass}`}
              >
                <option.icon className="h-9 w-9" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xl font-extrabold text-slate-800">
                  {option.label}
                </span>
                <span className="block text-sm font-medium text-slate-500">
                  {option.description}
                </span>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          data-testid="back-button"
          onClick={onBack}
          className="touch-ripple mt-6 flex h-16 w-full select-none items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-xl font-extrabold text-slate-700 shadow-xs transition hover:bg-slate-50 sm:w-auto sm:px-10"
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
          Back
        </button>
      </div>
    </div>
  );
}
