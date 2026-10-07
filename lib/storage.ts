import type { CartItem } from "./types";
import { PRODUCTS } from "./products";

const CART_KEY = "pos-kiosk:cart";
const TXN_COUNTER_KEY = "pos-kiosk:txn-counter";

/**
 * Load the cart from localStorage. The stored shape is a minimal
 * { id, quantity } list, so the product data (name, price) always
 * comes from the current catalog, not from stale storage.
 */
export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { id: string; quantity: number }[];
    return parsed
      .map(({ id, quantity }) => {
        const product = PRODUCTS.find((p) => p.id === id);
        if (!product || !Number.isFinite(quantity) || quantity < 1) return null;
        return { product, quantity: Math.floor(quantity) };
      })
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

/** Persist the cart to localStorage. */
export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const data = items.map((i) => ({ id: i.product.id, quantity: i.quantity }));
    window.localStorage.setItem(CART_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable (private mode, etc.) — the app still works in memory.
  }
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CART_KEY);
  } catch {
    // ignore
  }
}

/*
 * In-memory cart store backed by localStorage, exposed for
 * useSyncExternalStore so React state always matches the
 * persisted cart (SSR-safe: the server snapshot is an empty cart).
 */
let cartCache: CartItem[] | null = null;
const cartListeners = new Set<() => void>();

export function getCartSnapshot(): CartItem[] {
  if (cartCache === null) cartCache = loadCart();
  return cartCache;
}

export function setCartAndSave(items: CartItem[]): void {
  cartCache = items;
  saveCart(items);
  cartListeners.forEach((listener) => listener());
}

export function subscribeCart(listener: () => void): () => void {
  cartListeners.add(listener);
  return () => {
    cartListeners.delete(listener);
  };
}

/**
 * Read-and-increment transaction counter. Persisted so references
 * stay unique even after a page reload or a new browser session.
 */
export function nextTransactionCounter(): number {
  let current = 0;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(TXN_COUNTER_KEY);
      const parsed = raw ? Number.parseInt(raw, 10) : 0;
      current = Number.isFinite(parsed) ? parsed : 0;
    } catch {
      current = 0;
    }
  }
  const next = current + 1;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(TXN_COUNTER_KEY, String(next));
    } catch {
      // ignore
    }
  }
  return next;
}
