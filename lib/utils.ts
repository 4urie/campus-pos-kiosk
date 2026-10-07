import type { CartItem } from "./types";

/** Round to two decimal places to avoid floating point artifacts. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** subtotal = unit price × quantity */
export function calculateSubtotal(item: CartItem): number {
  return round2(item.product.price * item.quantity);
}

/** total = sum of all subtotals */
export function calculateTotal(items: CartItem[]): number {
  return round2(items.reduce((sum, item) => sum + calculateSubtotal(item), 0));
}

/** change = amount paid − total */
export function calculateChange(amountPaid: number, total: number): number {
  return round2(amountPaid - total);
}

/** Format a number as Philippine Peso, e.g. ₱175.00 */
export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Unique transaction reference: TXN-YYYYMMDD-NNN
 * The counter increments for every completed transaction, so two
 * transactions are never given the same reference.
 */
export function generateTransactionNumber(counter: number, date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `TXN-${y}${m}${d}-${String(counter).padStart(3, "0")}`;
}

/** Format an ISO date string for display on the receipt. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export interface CashValidationResult {
  ok: boolean;
  amountPaid: number;
  error: string;
}

/**
 * Validate the cash amount entered by the customer.
 * Rules (in order):
 *  - blank   → "Please enter the amount paid."
 *  - not a valid money amount → "Invalid payment amount."
 *  - negative → rejected as invalid
 *  - less than total → insufficient, payment must not complete
 *  - equal to or greater than total → ok
 */
export function validateCashPayment(input: string, total: number): CashValidationResult {
  const trimmed = input.trim();
  if (trimmed === "") {
    return { ok: false, amountPaid: 0, error: "Please enter the amount paid." };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return { ok: false, amountPaid: 0, error: "Invalid payment amount." };
  }
  const amount = round2(Number(trimmed));
  if (amount < 0) {
    return { ok: false, amountPaid: 0, error: "Invalid payment amount." };
  }
  if (amount < total) {
    return {
      ok: false,
      amountPaid: 0,
      error: `Insufficient payment. Please enter at least ${formatPeso(total)}.`,
    };
  }
  return { ok: true, amountPaid: amount, error: "" };
}
