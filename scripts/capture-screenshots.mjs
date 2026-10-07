/**
 * Captures kiosk screenshots for documentation.
 * Usage: start the app (npm start) and run: npm run screenshots
 */
import { existsSync, mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const BASE = process.env.POS_E2E_URL || "http://localhost:3000";
const OUT_DIR = "docs/screenshots";

const EDGE_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];
const edgePath = EDGE_CANDIDATES.find((p) => existsSync(p));
if (!edgePath) {
  console.error("Microsoft Edge executable not found.");
  process.exit(2);
}

mkdirSync(OUT_DIR, { recursive: true });
const browser = await puppeteer.launch({ executablePath: edgePath, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1366, height: 768 });

const shot = (name) => page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage: true });

try {
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForSelector('[data-testid="screen-items"]');

  // 1. Item selection with a cart in progress
  await page.click('[data-testid="product-card-coffee"]');
  await page.click('[data-testid="product-card-coffee"]');
  await page.click('[data-testid="product-card-sandwich"]');
  await page.click('[data-testid="product-card-soft-drink"]');
  await shot("1-item-selection");
  console.log("saved 1-item-selection.png");

  // 2. Cash payment with validation error
  await page.click('[data-testid="continue-to-payment"]');
  await page.waitForSelector('[data-testid="screen-summary"]');
  await shot("2-order-summary");
  console.log("saved 2-order-summary.png");
  await page.click('[data-testid="summary-continue"]');
  await page.waitForSelector('[data-testid="screen-payment-method"]');
  await shot("3-payment-method");
  console.log("saved 3-payment-method.png");
  await page.click('[data-testid="pay-option-cash"]');
  await page.waitForSelector('[data-testid="screen-cash"]');
  await page.focus('[data-testid="cash-input"]');
  await page.type('[data-testid="cash-input"]', "100");
  await page.click('[data-testid="pay-now"]');
  await new Promise((r) => setTimeout(r, 300));
  await shot("4-cash-insufficient");
  console.log("saved 4-cash-insufficient.png");

  // 3. Receipt after a completed transaction
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyA");
  await page.keyboard.up("Control");
  await page.type('[data-testid="cash-input"]', "200");
  await page.click('[data-testid="pay-now"]');
  await page.waitForSelector('[data-testid="screen-success"]');
  await shot("5-payment-success");
  console.log("saved 5-payment-success.png");
  await page.click('[data-testid="view-receipt"]');
  await page.waitForSelector('[data-testid="screen-receipt"]');
  await shot("6-receipt");
  console.log("saved 6-receipt.png");
} finally {
  await browser.close();
}
