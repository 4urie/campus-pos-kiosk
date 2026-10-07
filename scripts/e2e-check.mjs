/**
 * End-to-end verification of the exam acceptance flow.
 *
 * Drives the real app in headless Microsoft Edge (puppeteer-core, no
 * browser download needed) and walks every exam test case:
 * product selection, quantity controls, removal, summary/back,
 * insufficient cash, overpaid cash, exact cash, QR, card, receipts,
 * unique transaction references, and New Transaction reset.
 *
 * Usage: start the app (npm start) and run: npm run test:e2e
 */
import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const BASE = process.env.POS_E2E_URL || "http://localhost:3000";

const EDGE_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

let passed = 0;
let failed = 0;

function check(name, ok, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function textOf(page, selector) {
  const el = await page.$(selector);
  if (!el) return null;
  return (await el.evaluate((node) => node.textContent.trim()));
}

async function toastTexts(page) {
  const els = await page.$$('[data-testid="toast"]');
  return Promise.all(els.map((el) => el.evaluate((node) => node.textContent.trim())));
}

async function setInput(page, selector, value) {
  await page.focus(selector);
  // Select the whole current value with the keyboard, then replace it
  // by typing (works regardless of cursor position or selection state).
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyA");
  await page.keyboard.up("Control");
  if (value === "") {
    await page.keyboard.press("Backspace");
    return;
  }
  await page.type(selector, value);
}

const click = (page, selector) => page.click(selector);
const waitFor = (page, selector, timeout = 15000) =>
  page.waitForSelector(selector, { timeout });

const edgePath = EDGE_CANDIDATES.find((p) => existsSync(p));
if (!edgePath) {
  console.error("Microsoft Edge executable not found.");
  process.exit(2);
}

const browser = await puppeteer.launch({
  executablePath: edgePath,
  headless: true,
  args: ["--no-first-run"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1366, height: 768 });

try {
  console.log("\n[Setup] Open application and reset kiosk state");
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle2" });
  await waitFor(page, '[data-testid="screen-items"]');
  check("application loads", true);

  console.log("\nTEST 1: At least 6 products visible with names and prices");
  const cards = await page.$$('[data-testid^="product-card-"]');
  check("6 product cards rendered", cards.length === 6, `got ${cards.length}`);
  for (const id of ["coffee", "sandwich", "soft-drink", "cookies", "water", "chocolate"]) {
    const cardText = await textOf(page, `[data-testid="product-card-${id}"]`);
    check(`${id} card shows name and price`, cardText !== null && cardText.includes("₱"), cardText);
  }

  console.log("\nTEST 2: Add Coffee x2, Sandwich x1, Soft Drink x1");
  await click(page, '[data-testid="product-card-coffee"]');
  await click(page, '[data-testid="product-card-coffee"]');
  await click(page, '[data-testid="product-card-sandwich"]');
  await click(page, '[data-testid="product-card-soft-drink"]');
  check("Coffee subtotal ₱90.00", (await textOf(page, '[data-testid="item-subtotal-coffee"]')) === "₱90.00");
  check("Sandwich subtotal ₱50.00", (await textOf(page, '[data-testid="item-subtotal-sandwich"]')) === "₱50.00");
  check("Soft Drink subtotal ₱35.00", (await textOf(page, '[data-testid="item-subtotal-soft-drink"]')) === "₱35.00");
  check("Total ₱175.00", (await textOf(page, '[data-testid="cart-total"]')) === "₱175.00");

  console.log("\nTouch targets: controls are large enough for a kiosk");
  // On a cold dev server CSS compiles on first request; wait until the
  // card is actually styled before measuring.
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-testid="product-card-coffee"]');
      return el !== null && el.getBoundingClientRect().height >= 100;
    },
    { timeout: 15000 }
  );
  const cardBox = await page.$eval('[data-testid="product-card-coffee"]', (el) => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  });
  check("product card at least 150px tall", cardBox.h >= 150, JSON.stringify(cardBox));
  const incBox = await page.$eval('[data-testid="qty-inc-coffee"]', (el) => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  });
  check("quantity button at least 44px", incBox.w >= 44 && incBox.h >= 44, JSON.stringify(incBox));
  const continueH = await page.$eval(
    '[data-testid="continue-to-payment"]',
    (el) => Math.round(el.getBoundingClientRect().height)
  );
  check("continue button at least 60px tall", continueH >= 60, `${continueH}px`);

  console.log("\nTEST 3: Coffee 2 -> 3, then 3 -> 2");
  await click(page, '[data-testid="qty-inc-coffee"]');
  check("Coffee subtotal ₱135.00", (await textOf(page, '[data-testid="item-subtotal-coffee"]')) === "₱135.00");
  check("Total ₱220.00", (await textOf(page, '[data-testid="cart-total"]')) === "₱220.00");
  await click(page, '[data-testid="qty-dec-coffee"]');
  check("Coffee subtotal back to ₱90.00", (await textOf(page, '[data-testid="item-subtotal-coffee"]')) === "₱90.00");
  check("Total back to ₱175.00", (await textOf(page, '[data-testid="cart-total"]')) === "₱175.00");

  console.log("\nQuantity guard: minus disabled at quantity 1");
  const minusDisabled = await page.$eval('[data-testid="qty-dec-sandwich"]', (el) => el.disabled);
  check("minus button disabled at quantity 1", minusDisabled === true);

  console.log("\nCart persistence: reload keeps the order (localStorage)");
  await page.reload({ waitUntil: "networkidle2" });
  await waitFor(page, '[data-testid="screen-items"]');
  check("cart restored after reload", (await textOf(page, '[data-testid="cart-total"]')) === "₱175.00");
  check("coffee quantity still 2", (await textOf(page, '[data-testid="qty-coffee"]')) === "2");

  console.log("\nTEST 4: Remove Soft Drink");
  await click(page, '[data-testid="remove-soft-drink"]');
  check("Soft Drink removed from cart", (await page.$('[data-testid="cart-item-soft-drink"]')) === null);
  check("Total becomes ₱140.00", (await textOf(page, '[data-testid="cart-total"]')) === "₱140.00");

  console.log("\nTEST 5: Order summary");
  await click(page, '[data-testid="continue-to-payment"]');
  await waitFor(page, '[data-testid="screen-summary"]');
  check("Coffee summary line ₱90.00", (await textOf(page, '[data-testid="summary-item-coffee"]'))?.includes("₱90.00") === true);
  check("Sandwich summary line ₱50.00", (await textOf(page, '[data-testid="summary-item-sandwich"]'))?.includes("₱50.00") === true);
  check("Summary total ₱140.00", (await textOf(page, '[data-testid="summary-total"]')) === "₱140.00");

  console.log("\nTEST 6: Back preserves items and quantities");
  await click(page, '[data-testid="back-button"]');
  await waitFor(page, '[data-testid="screen-items"]');
  check("coffee quantity still 2", (await textOf(page, '[data-testid="qty-coffee"]')) === "2");
  check("sandwich quantity still 1", (await textOf(page, '[data-testid="qty-sandwich"]')) === "1");
  check("total still ₱140.00", (await textOf(page, '[data-testid="cart-total"]')) === "₱140.00");

  console.log("\nPayment method selection: 3 large options");
  await click(page, '[data-testid="continue-to-payment"]');
  await waitFor(page, '[data-testid="screen-summary"]');
  await click(page, '[data-testid="summary-continue"]');
  await waitFor(page, '[data-testid="screen-payment-method"]');
  check("Cash option", (await page.$('[data-testid="pay-option-cash"]')) !== null);
  check("QR Payment option", (await page.$('[data-testid="pay-option-qr-payment"]')) !== null);
  check("Credit/Debit Card option", (await page.$('[data-testid="pay-option-credit-debit-card"]')) !== null);

  console.log("\nTEST 7: Cash ₱100 for ₱140 total — rejected");
  await click(page, '[data-testid="pay-option-cash"]');
  await waitFor(page, '[data-testid="screen-cash"]');
  // blank input
  await click(page, '[data-testid="pay-now"]');
  check("blank -> 'Please enter the amount paid.'", (await textOf(page, '[data-testid="cash-error"]')) === "Please enter the amount paid.");
  // invalid input
  await setInput(page, '[data-testid="cash-input"]', "abc");
  await click(page, '[data-testid="pay-now"]');
  check("invalid -> 'Invalid payment amount.'", (await textOf(page, '[data-testid="cash-error"]')) === "Invalid payment amount.");
  // negative input
  await setInput(page, '[data-testid="cash-input"]', "-50");
  await click(page, '[data-testid="pay-now"]');
  check("negative rejected", (await textOf(page, '[data-testid="cash-error"]')) === "Invalid payment amount.");
  // insufficient
  await setInput(page, '[data-testid="cash-input"]', "100");
  const inputValue = await page.$eval('[data-testid="cash-input"]', (el) => el.value);
  await click(page, '[data-testid="pay-now"]');
  const insuffError = await textOf(page, '[data-testid="cash-error"]');
  check(
    "insufficient message",
    insuffError === "Insufficient payment. Please enter at least ₱140.00.",
    `input='${inputValue}', error='${insuffError}'`
  );
  check("still on payment screen", (await page.$('[data-testid="screen-cash"]')) !== null);
  check("no receipt created", (await page.$('[data-testid="screen-receipt"]')) === null);

  console.log("\nTEST 8: Cash ₱200 for ₱140 total — change ₱60.00");
  await setInput(page, '[data-testid="cash-input"]', "200");
  await click(page, '[data-testid="pay-now"]');
  await waitFor(page, '[data-testid="screen-success"]');
  check("amount paid ₱200.00", (await textOf(page, '[data-testid="success-paid"]')) === "₱200.00");
  check("change ₱60.00", (await textOf(page, '[data-testid="success-change"]')) === "₱60.00");
  check("method Cash", (await textOf(page, '[data-testid="success-method"]')) === "Cash");
  const txn1 = await textOf(page, '[data-testid="success-txn"]');
  check("transaction number format TXN-YYYYMMDD-NNN", /^TXN-\d{8}-\d{3}$/.test(txn1), txn1);

  console.log("\nTEST 12: Receipt reflects the actual transaction");
  await click(page, '[data-testid="view-receipt"]');
  await waitFor(page, '[data-testid="screen-receipt"]');
  check("receipt txn matches", (await textOf(page, '[data-testid="receipt-txn"]')) === txn1);
  check("receipt total ₱140.00", (await textOf(page, '[data-testid="receipt-total"]')) === "₱140.00");
  check("receipt payment CASH", (await textOf(page, '[data-testid="receipt-payment-summary"]')) === "CASH");
  check("receipt paid ₱200.00", (await textOf(page, '[data-testid="receipt-paid"]')) === "₱200.00");
  check("receipt change ₱60.00", (await textOf(page, '[data-testid="receipt-change"]')) === "₱60.00");
  check("receipt status Payment Successful", (await textOf(page, '[data-testid="receipt-status"]')) === "Payment Successful");
  const coffeeLine = await textOf(page, '[data-testid="receipt-item-coffee"]');
  check("Coffee line: 2 x ₱45.00 and ₱90.00", coffeeLine?.includes("2 × ₱45.00") && coffeeLine?.includes("₱90.00"), coffeeLine);
  const sandwichLine = await textOf(page, '[data-testid="receipt-item-sandwich"]');
  check("Sandwich line: 1 x ₱50.00 and ₱50.00", sandwichLine?.includes("1 × ₱50.00") && sandwichLine?.includes("₱50.00"), sandwichLine);
  check("datetime shown", (await textOf(page, '[data-testid="receipt-datetime"]'))?.length > 5);

  console.log("\nTEST 14: New Transaction resets everything");
  await click(page, '[data-testid="new-transaction"]');
  await waitFor(page, '[data-testid="screen-items"]');
  check("cart is empty", (await textOf(page, '[data-testid="cart-total"]')) === "₱0.00");
  check("no cart items rendered", (await page.$('[data-testid^="cart-item-"]')) === null);

  console.log("\nTEST 10: QR payment (amount paid = total, change ₱0.00)");
  await click(page, '[data-testid="product-card-water"]');
  await click(page, '[data-testid="continue-to-payment"]');
  await waitFor(page, '[data-testid="screen-summary"]');
  await click(page, '[data-testid="summary-continue"]');
  await waitFor(page, '[data-testid="screen-payment-method"]');
  await click(page, '[data-testid="pay-option-qr-payment"]');
  await waitFor(page, '[data-testid="screen-qr"]');
  check("QR placeholder shown", (await page.$('[role="img"][aria-label="Simulated QR code placeholder"]')) !== null);
  check("QR total ₱20.00", (await textOf(page, '[data-testid="qr-total"]')) === "₱20.00");
  check("scan instruction shown", (await textOf(page, '[data-testid="screen-qr"]'))?.includes("Scan the QR code using your supported payment application."));
  await click(page, '[data-testid="qr-confirm"]');
  await waitFor(page, '[data-testid="screen-success"]');
  const txn2 = await textOf(page, '[data-testid="success-txn"]');
  check("amount paid = total ₱20.00", (await textOf(page, '[data-testid="success-paid"]')) === "₱20.00");
  check("change ₱0.00", (await textOf(page, '[data-testid="success-change"]')) === "₱0.00");
  check("method QR Payment", (await textOf(page, '[data-testid="success-method"]')) === "QR Payment");
  check("different reference (TEST 13)", txn2 !== txn1, `${txn1} vs ${txn2}`);
  await click(page, '[data-testid="view-receipt"]');
  await waitFor(page, '[data-testid="screen-receipt"]');
  check("QR receipt payment QR PAYMENT", (await textOf(page, '[data-testid="receipt-payment-summary"]')) === "QR PAYMENT");
  await click(page, '[data-testid="new-transaction"]');

  console.log("\nTEST 11: Credit/Debit card with processing state");
  await click(page, '[data-testid="product-card-chocolate"]');
  await click(page, '[data-testid="continue-to-payment"]');
  await waitFor(page, '[data-testid="screen-summary"]');
  await click(page, '[data-testid="summary-continue"]');
  await waitFor(page, '[data-testid="screen-payment-method"]');
  await click(page, '[data-testid="pay-option-credit-debit-card"]');
  await waitFor(page, '[data-testid="screen-card"]');
  check("tap/insert/swipe instruction", (await textOf(page, '[data-testid="screen-card"]'))?.includes("Please tap, insert, or swipe your card."));
  await click(page, '[data-testid="card-process"]');
  await waitFor(page, '[data-testid="card-processing"]', 5000);
  check("'Processing payment...' state shown", (await textOf(page, '[data-testid="card-processing"]'))?.includes("Processing payment..."));
  await waitFor(page, '[data-testid="screen-success"]');
  const txn3 = await textOf(page, '[data-testid="success-txn"]');
  check("method Credit/Debit Card", (await textOf(page, '[data-testid="success-method"]')) === "Credit/Debit Card");
  check("change ₱0.00", (await textOf(page, '[data-testid="success-change"]')) === "₱0.00");
  check("unique reference vs previous two", txn3 !== txn1 && txn3 !== txn2, txn3);

  console.log("\nReceipt method check for card payment");
  await click(page, '[data-testid="view-receipt"]');
  await waitFor(page, '[data-testid="screen-receipt"]');
  check("receipt payment CREDIT/DEBIT CARD", (await textOf(page, '[data-testid="receipt-payment-summary"]')) === "CREDIT/DEBIT CARD");
  await click(page, '[data-testid="new-transaction"]');
  await waitFor(page, '[data-testid="screen-items"]');

  console.log("\nTEST 9: Exact cash — ₱45 for ₱45 total, change ₱0.00");
  await click(page, '[data-testid="product-card-coffee"]');
  await click(page, '[data-testid="continue-to-payment"]');
  await waitFor(page, '[data-testid="screen-summary"]');
  await click(page, '[data-testid="summary-continue"]');
  await waitFor(page, '[data-testid="screen-payment-method"]');
  await click(page, '[data-testid="pay-option-cash"]');
  await waitFor(page, '[data-testid="screen-cash"]');
  await setInput(page, '[data-testid="cash-input"]', "45");
  await click(page, '[data-testid="pay-now"]');
  await waitFor(page, '[data-testid="screen-success"]');
  check("change ₱0.00", (await textOf(page, '[data-testid="success-change"]')) === "₱0.00");
  const txn4 = await textOf(page, '[data-testid="success-txn"]');
  const unique = new Set([txn1, txn2, txn3, txn4]).size === 4;
  check("all four transaction references unique", unique, [txn1, txn2, txn3, txn4].join(", "));
  await click(page, '[data-testid="view-receipt"]');
  await waitFor(page, '[data-testid="screen-receipt"]');
  check("exact-cash receipt change ₱0.00", (await textOf(page, '[data-testid="receipt-change"]')) === "₱0.00");
  await click(page, '[data-testid="new-transaction"]');
  await waitFor(page, '[data-testid="screen-items"]');

  console.log("\nEmpty-cart guard: Continue with no items shows a message");
  await click(page, '[data-testid="continue-to-payment"]');
  await waitFor(page, '[data-testid="toast"]', 5000);
  const toastTextsAfterEmpty = await toastTexts(page);
  check(
    "empty cart message shown",
    toastTextsAfterEmpty.some((t) => t.toLowerCase().includes("empty")),
    toastTextsAfterEmpty.join(" | ")
  );
  check("stayed on item selection", (await page.$('[data-testid="screen-items"]')) !== null);

  console.log("\nResponsive check: phone viewport renders the kiosk");
  await page.setViewport({ width: 390, height: 844 });
  await new Promise((r) => setTimeout(r, 500));
  const phoneCards = await page.$$('[data-testid^="product-card-"]');
  check("product cards render at 390px", phoneCards.length === 6, `got ${phoneCards.length}`);
  check("cart panel present at 390px", (await page.$('[data-testid="cart-total"]')) !== null);

  console.log("\nFeedback toasts: add a product and verify message");
  await page.setViewport({ width: 1366, height: 768 });
  await click(page, '[data-testid="product-card-cookies"]');
  await waitFor(page, '[data-testid="toast"]', 5000);
  const toastTextsAfterAdd = await toastTexts(page);
  check("'Cookies added' toast", toastTextsAfterAdd.includes("Cookies added"), toastTextsAfterAdd.join(" | "));
} catch (error) {
  failed += 1;
  console.error("\nE2E ERROR:", error.message);
} finally {
  await browser.close();
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
