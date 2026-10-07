"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import Header from "./Header";
import Catalog from "./Catalog";
import Cart from "./Cart";
import OrderSummary from "./OrderSummary";
import PaymentMethod from "./PaymentMethod";
import CashPayment from "./CashPayment";
import QRPayment from "./QRPayment";
import CardPayment from "./CardPayment";
import PaymentSuccess from "./PaymentSuccess";
import Receipt from "./Receipt";
import Toasts from "./Toast";
import {
  getCartSnapshot,
  nextTransactionCounter,
  setCartAndSave,
  subscribeCart,
} from "@/lib/storage";
import { calculateChange, calculateTotal, generateTransactionNumber } from "@/lib/utils";
import type {
  CartItem,
  PaymentMethod as PaymentMethodType,
  Product,
  Screen,
  ToastMessage,
  Transaction,
} from "@/lib/types";

/**
 * Stable server snapshot for useSyncExternalStore. React requires the
 * same cached value on every call — returning a fresh `[]` each time
 * makes it re-render in an infinite loop ("getServerSnapshot should
 * be cached"). The cart is never mutated in place (every update
 * builds a new array), so sharing one constant is safe.
 */
const EMPTY_CART: CartItem[] = [];

export default function POSKiosk() {
  const [screen, setScreen] = useState<Screen>("items");
  // localStorage-backed cart store (survives accidental reloads,
  // SSR-safe via useSyncExternalStore).
  const cart = useSyncExternalStore(subscribeCart, getCartSnapshot, () => EMPTY_CART);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastId = useRef(0);

  const showToast = useCallback((message: string) => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  }, []);

  const addToCart = useCallback(
    (product: Product) => {
      const current = getCartSnapshot();
      const existing = current.find((i) => i.product.id === product.id);
      const next = existing
        ? current.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...current, { product, quantity: 1 }];
      setCartAndSave(next);
      showToast(`${product.name} added`);
    },
    [showToast]
  );

  const changeQuantity = useCallback(
    (productId: string, delta: number) => {
      const current = getCartSnapshot();
      const target = current.find((i) => i.product.id === productId);
      if (!target) return;
      const nextQuantity = target.quantity + delta;
      if (nextQuantity < 1) {
        showToast("Invalid quantity");
        return;
      }
      setCartAndSave(
        current.map((i) =>
          i.product.id === productId ? { ...i, quantity: nextQuantity } : i
        )
      );
      showToast("Quantity updated");
    },
    [showToast]
  );

  const removeItem = useCallback(
    (productId: string) => {
      setCartAndSave(getCartSnapshot().filter((i) => i.product.id !== productId));
      showToast("Item removed");
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCartAndSave([]);
    showToast("Order cleared");
  }, [showToast]);

  const total = calculateTotal(cart);
  const getQuantity = (productId: string) =>
    cart.find((i) => i.product.id === productId)?.quantity ?? 0;

  const handleContinueFromCart = () => {
    if (cart.length === 0) {
      showToast("Your cart is empty. Tap a product to add it first.");
      return;
    }
    setScreen("summary");
  };

  const handleSelectPaymentMethod = (method: PaymentMethodType) => {
    if (method === "Cash") setScreen("cash");
    else if (method === "QR Payment") setScreen("qr");
    else setScreen("card");
  };

  /**
   * Complete the transaction: build the record with a fresh unique
   * reference, then move to the success screen.
   */
  const completePayment = useCallback(
    (method: PaymentMethodType, amountPaid: number) => {
      const finalTotal = calculateTotal(cart);
      const change = calculateChange(amountPaid, finalTotal);
      const reference = generateTransactionNumber(nextTransactionCounter());
      const completed: Transaction = {
        id: reference,
        date: new Date().toISOString(),
        paymentMethod: method,
        items: cart.map((i) => ({ ...i })),
        total: finalTotal,
        amountPaid,
        change,
      };
      setTransaction(completed);
      setScreen("success");
      showToast("Payment Successful");
    },
    [cart, showToast]
  );

  /** Wipe the order and payment data and start over at item selection. */
  const resetTransaction = useCallback(() => {
    setCartAndSave([]);
    setTransaction(null);
    setScreen("items");
    showToast("Transaction completed successfully");
  }, [showToast]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header onNotify={showToast} />
      <main className="min-h-0 flex-1">
        {screen === "items" && (
          /*
           * Kiosk workspace: fixed viewport on desktop with internal
           * scrolling for the grid and the cart; stacks and scrolls the
           * whole page on narrow (phone) screens.
           */
          <div data-testid="screen-items" className="h-full overflow-y-auto lg:overflow-hidden">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6 lg:h-full lg:flex-row">
              <Catalog getQuantity={getQuantity} onAdd={addToCart} />
              <Cart
                items={cart}
                total={total}
                onIncrease={(id) => changeQuantity(id, 1)}
                onDecrease={(id) => changeQuantity(id, -1)}
                onRemove={removeItem}
                onClear={clearCart}
                onNotify={showToast}
                onContinue={handleContinueFromCart}
              />
            </div>
          </div>
        )}

        {screen === "summary" && (
          <OrderSummary
            items={cart}
            total={total}
            onBack={() => setScreen("items")}
            onContinue={() => setScreen("payment")}
          />
        )}

        {screen === "payment" && (
          <PaymentMethod
            total={total}
            onSelect={handleSelectPaymentMethod}
            onBack={() => setScreen("summary")}
          />
        )}

        {screen === "cash" && (
          <CashPayment
            total={total}
            onBack={() => setScreen("payment")}
            onPay={(amountPaid) => completePayment("Cash", amountPaid)}
          />
        )}

        {screen === "qr" && (
          <QRPayment
            total={total}
            onBack={() => setScreen("payment")}
            onConfirm={() => completePayment("QR Payment", total)}
          />
        )}

        {screen === "card" && (
          <CardPayment
            total={total}
            onBack={() => setScreen("payment")}
            onProcessed={() => completePayment("Credit/Debit Card", total)}
          />
        )}

        {screen === "success" && transaction && (
          <PaymentSuccess transaction={transaction} onViewReceipt={() => setScreen("receipt")} />
        )}

        {screen === "receipt" && transaction && (
          <Receipt transaction={transaction} onNewTransaction={resetTransaction} />
        )}
      </main>
      <Toasts toasts={toasts} />
    </div>
  );
}
