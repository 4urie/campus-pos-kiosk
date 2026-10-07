"use client";

import { useState } from "react";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { formatPeso } from "@/lib/utils";

interface CardPaymentProps {
  total: number;
  onBack: () => void;
  onProcessed: () => void;
}

export default function CardPayment({ total, onBack, onProcessed }: CardPaymentProps) {
  const [processing, setProcessing] = useState(false);

  function handleProcess() {
    setProcessing(true);
    window.setTimeout(onProcessed, 1800);
  }

  return (
    <div data-testid="screen-card" className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Credit/Debit Card</h2>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-6 py-4 shadow-sm">
          <span className="flex items-center gap-3 text-lg font-extrabold text-slate-800">
            <CreditCard className="h-6 w-6 text-sky-700" aria-hidden="true" />
            Total Amount
          </span>
          <span className="text-2xl font-black text-brand-800" data-testid="card-total">
            {formatPeso(total)}
          </span>
        </div>

        <div className="mt-6 flex flex-col items-center gap-5 rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-sm">
          <span className="flex h-24 w-36 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <CreditCard className="h-14 w-14" aria-hidden="true" />
          </span>
          <p className="text-lg font-semibold leading-relaxed text-slate-700">
            Please tap, insert, or swipe your card.
          </p>
          {processing && (
            <p
              data-testid="card-processing"
              className="flex items-center gap-3 text-lg font-extrabold text-sky-700"
            >
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              Processing payment...
            </p>
          )}
        </div>

        <button
          type="button"
          data-testid="card-process"
          onClick={handleProcess}
          disabled={processing}
          className="touch-ripple mt-6 flex h-16 w-full select-none items-center justify-center rounded-2xl bg-brand-600 text-xl font-extrabold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 disabled:opacity-60"
        >
          {processing ? "Processing payment..." : "Process Payment"}
        </button>

        <button
          type="button"
          data-testid="back-button"
          onClick={onBack}
          disabled={processing}
          className="touch-ripple mt-4 flex h-16 w-full select-none items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-xl font-extrabold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto sm:px-10"
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
          Back
        </button>
      </div>
    </div>
  );
}
