// Core domain types for the POS kiosk.

/** Catalog sections used by the category filter pills. */
export type ProductCategory = "coffee-drinks" | "bakery" | "cold-drinks" | "snacks";

/** Small chip shown on a product card, e.g. "Bestseller" or "330ml". */
export interface ProductTag {
  label: string;
  /** Tailwind classes for the chip's colors. */
  className: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  /** One-line description shown on the product card. */
  description: string;
  /** Product photo path under /public. */
  image: string;
  category: ProductCategory;
  /** Prominent tag on the left, e.g. "★ Bestseller". */
  badge?: ProductTag;
  /** Secondary tag on the right, e.g. "Hot", "330ml". */
  meta?: ProductTag;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = "Cash" | "QR Payment" | "Credit/Debit Card";

export interface Transaction {
  /** Unique reference, e.g. TXN-20261007-001 */
  id: string;
  /** ISO date string of when the transaction was completed */
  date: string;
  paymentMethod: PaymentMethod;
  /** Snapshot of the items in the completed transaction */
  items: CartItem[];
  total: number;
  amountPaid: number;
  change: number;
}

/** The kiosk screens, in flow order. */
export type Screen =
  | "items"
  | "summary"
  | "payment"
  | "cash"
  | "qr"
  | "card"
  | "success"
  | "receipt";

export interface ToastMessage {
  id: number;
  message: string;
}
