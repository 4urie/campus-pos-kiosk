import { CheckCircle2, ReceiptText } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatPeso } from "@/lib/utils";

interface PaymentSuccessProps {
  transaction: Transaction;
  onViewReceipt: () => void;
}

function DetailRow({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-right font-extrabold text-slate-900" data-testid={testId}>
        {value}
      </span>
    </div>
  );
}

export default function PaymentSuccess({ transaction, onViewReceipt }: PaymentSuccessProps) {
  return (
    <div data-testid="screen-success" className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-xl px-4 py-10 text-center sm:px-6">
        <CheckCircle2 className="mx-auto h-24 w-24 text-brand-500" aria-hidden="true" />
        <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
          Payment Successful
        </h2>
        <p className="mt-2 text-base font-medium text-slate-500">
          Transaction completed successfully
        </p>

        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white px-6 py-4 text-left shadow-sm">
          <DetailRow
            label="Transaction amount"
            value={formatPeso(transaction.total)}
            testId="success-total"
          />
          <DetailRow
            label="Amount paid"
            value={formatPeso(transaction.amountPaid)}
            testId="success-paid"
          />
          <DetailRow
            label="Payment method"
            value={transaction.paymentMethod}
            testId="success-method"
          />
          <DetailRow label="Change" value={formatPeso(transaction.change)} testId="success-change" />
          <div className="flex items-center justify-between gap-4 border-t-2 border-dashed border-slate-200 py-2">
            <span className="text-sm font-semibold text-slate-500">Transaction no.</span>
            <span
              className="font-mono font-extrabold text-brand-700"
              data-testid="success-txn"
            >
              {transaction.id}
            </span>
          </div>
        </div>

        <button
          type="button"
          data-testid="view-receipt"
          onClick={onViewReceipt}
          className="touch-ripple mt-8 flex h-16 w-full select-none items-center justify-center gap-3 rounded-2xl bg-brand-600 text-xl font-extrabold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
        >
          <ReceiptText className="h-6 w-6" aria-hidden="true" />
          View Receipt
        </button>
      </div>
    </div>
  );
}
