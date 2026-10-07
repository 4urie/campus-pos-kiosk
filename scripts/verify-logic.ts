/**
 * Verification of the exam test cases against the actual
 * lib/utils.ts functions (not a re-implementation).
 *
 * Run with: npm run verify
 */
import { PRODUCTS } from "../lib/products";
import type { CartItem } from "../lib/types";
import {
  calculateChange,
  calculateSubtotal,
  calculateTotal,
  formatPeso,
  generateTransactionNumber,
  validateCashPayment,
} from "../lib/utils";

let passed = 0;
let failed = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}`);
    console.log(`        expected: ${JSON.stringify(expected)}`);
    console.log(`        actual:   ${JSON.stringify(actual)}`);
  }
}

function item(id: string, quantity: number): CartItem {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) throw new Error(`Unknown product id: ${id}`);
  return { product, quantity };
}

console.log("\nProduct catalog");
check("at least 6 products are available", PRODUCTS.length >= 6, true);
check("Coffee is ₱45", PRODUCTS.find((p) => p.id === "coffee")?.price, 45);
check("Sandwich is ₱50", PRODUCTS.find((p) => p.id === "sandwich")?.price, 50);
check("Soft Drink is ₱35", PRODUCTS.find((p) => p.id === "soft-drink")?.price, 35);
check("Cookies is ₱25", PRODUCTS.find((p) => p.id === "cookies")?.price, 25);
check("Bottled Water is ₱20", PRODUCTS.find((p) => p.id === "water")?.price, 20);
check("Chocolate is ₱25", PRODUCTS.find((p) => p.id === "chocolate")?.price, 25);

console.log("\nTEST 2: Coffee x2, Sandwich x1, Soft Drink x1");
const cart2: CartItem[] = [item("coffee", 2), item("sandwich", 1), item("soft-drink", 1)];
check("Coffee subtotal = 90", calculateSubtotal(cart2[0]), 90);
check("Sandwich subtotal = 50", calculateSubtotal(cart2[1]), 50);
check("Soft Drink subtotal = 35", calculateSubtotal(cart2[2]), 35);
check("Total = 175", calculateTotal(cart2), 175);

console.log("\nTEST 3: Coffee 2 → 3, then 3 → 2");
const cart3Up: CartItem[] = [item("coffee", 3), item("sandwich", 1), item("soft-drink", 1)];
check("Coffee subtotal = 135", calculateSubtotal(cart3Up[0]), 135);
check("Total = 220", calculateTotal(cart3Up), 220);
check("Back to 2: Total = 175", calculateTotal(cart2), 175);

console.log("\nTEST 4: Remove Soft Drink");
const cart4: CartItem[] = [item("coffee", 2), item("sandwich", 1)];
check("Total = 140", calculateTotal(cart4), 140);

console.log("\nTEST 5: Order summary after removal");
check("Coffee subtotal = 90", calculateSubtotal(cart4[0]), 90);
check("Sandwich subtotal = 50", calculateSubtotal(cart4[1]), 50);
check("Total = 140", calculateTotal(cart4), 140);

console.log("\nTEST 7: Cash ₱100 for ₱140 total — must be rejected");
const r100 = validateCashPayment("100", 140);
check("rejected", r100.ok, false);
check("insufficient message", r100.error, "Insufficient payment. Please enter at least ₱140.00.");

console.log("\nTEST 8: Cash ₱200 for ₱140 total");
const r200 = validateCashPayment("200", 140);
check("accepted", r200.ok, true);
check("amount paid = 200", r200.amountPaid, 200);
check("change = 60", calculateChange(r200.amountPaid, 140), 60);

console.log("\nTEST 9: Exact cash ₱140 for ₱140 total");
const rExact = validateCashPayment("140", 140);
check("accepted", rExact.ok, true);
check("change = 0", calculateChange(rExact.amountPaid, 140), 0);

console.log("\nCash validation edge cases");
check("blank input", validateCashPayment("", 140).error, "Please enter the amount paid.");
check("blank input rejected", validateCashPayment("   ", 140).ok, false);
check("non-numeric input", validateCashPayment("abc", 140).error, "Invalid payment amount.");
check("negative input rejected", validateCashPayment("-50", 140).ok, false);
check("negative input message", validateCashPayment("-50", 140).error, "Invalid payment amount.");
check("decimal accepted", validateCashPayment("140.50", 140).ok, true);
check("decimal change", calculateChange(140.5, 140), 0.5);

console.log("\nTransaction numbers (TEST 13)");
const d = new Date(2026, 9, 7); // Oct 7, 2026
const txn1 = generateTransactionNumber(1, d);
const txn2 = generateTransactionNumber(2, d);
check("first reference", txn1, "TXN-20261007-001");
check("second reference", txn2, "TXN-20261007-002");
check("references are different", txn1 !== txn2, true);

console.log("\nPeso formatting");
check("₱90 → ₱90.00", formatPeso(90), "₱90.00");
check("₱175 → ₱175.00", formatPeso(175), "₱175.00");
check("₱0 → ₱0.00", formatPeso(0), "₱0.00");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
