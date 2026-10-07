"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, Banknote } from "lucide-react";
import { formatPeso, validateCashPayment } from "@/lib/utils";

interface CashPaymentProps {
  total: number;
  onBack: () => void;
  onPay: (amountPaid: number) => void;
}

export default function CashPayment({ total, onBack, onPay }: CashPaymentProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = validateCashPayment(input, total);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    onPay(result.amountPaid);
  }

  return (
    <div data-testid="screen-cash" className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Cash Payment</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">
          Enter the amount received from the customer.
        </p>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-6 py-4 shadow-sm">
          <span className="flex items-center gap-3 text-lg font-extrabold text-slate-800">
            <Banknote className="h-6 w-6 text-brand-700" aria-hidden="true" />
            Total Amount
          </span>
          <span className="text-2xl font-black text-brand-800" data-testid="cash-total">
            {formatPeso(total)}
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm"
        >
          <label htmlFor="amount-paid" className="text-lg font-extrabold text-slate-800">
            Amount Paid
          </label>
          <input
            id="amount-paid"
            data-testid="cash-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              if (error) setError("");
            }}
            className="h-20 rounded-2xl border-4 border-slate-300 bg-white px-4 text-center text-3xl font-extrabold text-slate-900 placeholder:text-slate-300 focus:border-brand-500 focus:outline-none"
          />
          {/* Reserved space keeps the layout steady when an error appears */}
          <p
            data-testid="cash-error"
            role="alert"
            className="min-h-7 text-base font-semibold text-red-600"
          >
            {error}
          </p>
          <button
            type="submit"
            data-testid="pay-now"
            className="touch-ripple flex h-16 select-none items-center justify-center rounded-2xl bg-brand-600 text-xl font-extrabold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
          >
            Pay Now
          </button>
        </form>

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
