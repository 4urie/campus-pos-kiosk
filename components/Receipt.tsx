import { RotateCcw } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { calculateSubtotal, formatDateTime, formatPeso } from "@/lib/utils";

interface ReceiptProps {
  transaction: Transaction;
  onNewTransaction: () => void;
}

export default function Receipt({ transaction, onNewTransaction }: ReceiptProps) {
  return (
    <div data-testid="screen-receipt" className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-md px-4 py-8 sm:px-6">
        <h2 className="text-center text-2xl font-black tracking-tight text-slate-900">
          Digital Receipt
        </h2>

        <div className="mt-6 rounded-3xl border border-slate-200/90 bg-white p-6 font-mono shadow-lg">
          <div className="border-b-2 border-dashed border-slate-200 pb-4 text-center">
            <p className="text-xl font-black tracking-widest text-slate-900">CAMPUS STORE POS</p>
            <p className="mt-1 text-sm text-slate-500">Official Digital Receipt</p>
          </div>

          <div className="space-y-1 border-b-2 border-dashed border-slate-200 py-4 text-sm text-slate-700">
            <p>
              <span className="font-bold">Transaction No.:</span>{" "}
              <span data-testid="receipt-txn">{transaction.id}</span>
            </p>
            <p>
              <span className="font-bold">Date/Time:</span>{" "}
              <span data-testid="receipt-datetime">{formatDateTime(transaction.date)}</span>
            </p>
            <p>
              <span className="font-bold">Payment Method:</span>{" "}
              <span data-testid="receipt-payment">{transaction.paymentMethod}</span>
            </p>
          </div>

          <div className="space-y-4 border-b-2 border-dashed border-slate-200 py-4 text-sm text-slate-700">
            {transaction.items.map((item) => (
              <div key={item.product.id} data-testid={`receipt-item-${item.product.id}`}>
                <p className="font-bold">{item.product.name}</p>
                <p>
                  {item.quantity} × {formatPeso(item.product.price)}
                </p>
                <p className="text-right font-bold">{formatPeso(calculateSubtotal(item))}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1 pt-4 text-slate-700">
            <p className="text-lg font-black text-slate-900">
              TOTAL:{" "}
              <span data-testid="receipt-total" className="text-brand-800">
                {formatPeso(transaction.total)}
              </span>
            </p>
            <p>
              PAYMENT:{" "}
              <span data-testid="receipt-payment-summary">
                {transaction.paymentMethod.toUpperCase()}
              </span>
            </p>
            <p>
              AMOUNT PAID: <span data-testid="receipt-paid">{formatPeso(transaction.amountPaid)}</span>
            </p>
            <p>
              CHANGE: <span data-testid="receipt-change">{formatPeso(transaction.change)}</span>
            </p>
            <p>
              STATUS:{" "}
              <span data-testid="receipt-status" className="font-bold text-brand-700">
                Payment Successful
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          data-testid="new-transaction"
          onClick={onNewTransaction}
          className="touch-ripple mt-6 flex h-16 w-full select-none items-center justify-center gap-3 rounded-2xl bg-brand-600 text-xl font-extrabold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
        >
          <RotateCcw className="h-6 w-6" aria-hidden="true" />
          New Transaction
        </button>
      </div>
    </div>
  );
}
