# Touchscreen POS Kiosk

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8)

## Project Description

A touchscreen-oriented **self-service Point of Sale (POS) kiosk** for a campus food and
merchandise outlet, built for the IT415 Practical Examination. Customers select products
by tapping large cards, review their order, pay with one of three payment methods
(Cash, QR Payment, Credit/Debit Card), and receive a digital receipt — with no keyboard
required at any step.

All state (cart, transaction counter) is kept in the browser with `localStorage`; no
database and no real payment gateway are used, so the app runs fully locally and
deploys to Vercel with zero configuration.

**Transaction flow:**

```
ITEM SELECTION → ORDER SUMMARY → PAYMENT METHOD → PAYMENT PROCESSING
              → PAYMENT SUCCESSFUL → RECEIPT → NEW TRANSACTION
```

## Features

- **6 products** (Coffee ₱45, Sandwich ₱50, Soft Drink ₱35, Cookies ₱25,
  Bottled Water ₱20, Chocolate ₱25) on large tap-to-add cards with quantity badges
- **Cart / current order** with unit price, quantity, subtotal per line, big
  **+**/**−**/remove controls, and a live total
- **Order Summary** screen; *Back* returns to item selection with the cart,
  quantities, and total fully preserved
- **3 payment methods** as large touch cards:
  - **Cash** — amount-paid input with full validation (blank, invalid, negative,
    insufficient) and correct change calculation, including ₱0.00 for exact payment
  - **QR Payment** — simulated QR placeholder, scan instruction, Confirm Payment;
    amount paid = total, change = ₱0.00
  - **Credit/Debit Card** — tap/insert/swipe instruction, visible
    "Processing payment..." state; amount paid = total, change = ₱0.00
- **Payment Successful** screen with amount, amount paid, method, change, and a
  **unique transaction reference** (`TXN-YYYYMMDD-NNN`, never reused)
- **Digital receipt** (CAMPUS STORE POS) with transaction no., date/time, method,
  itemized lines (`qty × unit price` / subtotal), total, amount paid, change, status
- **New Transaction** button that clears the cart, payment data, and receipt, and
  returns to item selection
- Toast feedback for every important action ("Coffee added", "Quantity updated",
  "Item removed", "Payment Successful", …)
- Cart persists in `localStorage`, so an accidental refresh never loses an order
- Responsive layout that works on desktop, tablet, and phone touchscreens

## Technology Used

| Technology        | Purpose                                            |
| ----------------- | -------------------------------------------------- |
| Next.js 16 (App Router) | React framework, static prerendering          |
| React 19          | UI and state management (hooks)                    |
| TypeScript 5      | Type safety (`Product`, `CartItem`, `PaymentMethod`, `Transaction`) |
| Tailwind CSS 4    | Styling (large touch targets, kiosk layout)        |
| Lucide React      | Icons (products, payment methods, controls)        |
| localStorage      | Cart persistence and transaction counter           |
| tsx               | Running the logic verification script              |
| puppeteer-core + Edge | Headless end-to-end verification of the whole flow |

## How to Install

Requirements: Node.js 18.18+ (tested on Node 24) and npm.

```bash
npm install
```

## How to Run

```bash
npm run dev
```

Open <http://localhost:3000>.

## How to Build

```bash
npm run build   # production build (type-checked)
npm start       # serve the production build
```

## Testing

The project ships with two verification suites that run against the real code:

```bash
npm run verify     # 38 logic checks: subtotals, totals, cash validation,
                   # change, transaction numbers, peso formatting
npm run test:e2e   # 76 browser checks: walks every exam test case in
                   # headless Microsoft Edge (start the app first)
npm run lint       # ESLint
```

Screenshots of every screen are in `docs/screenshots/`.

## Git/GitHub Workflow

Development was done in real, verifiable stages on the `main` branch, with the app
building (type-checked) at every stage:

| Stage | Commit | What was built |
| ----- | ------ | -------------- |
| 1. project setup | `aa2330e` | Next.js + TypeScript + Tailwind scaffold |
| 2. core logic | `7a63e98` | Types, product catalog, pricing/validation utilities, logic test suite |
| 3. initial UI + product selection | `2e9b21e` | Kiosk layout, product cards, cart with quantity controls, toasts |
| 4. order summary | `0e6630c` | Order summary + payment method selection, back navigation |
| 5. payment validation | `e216cb4` | Cash payment with full validation and change calculation |
| 6. QR + card payments | `52c2a70` | Simulated QR and card flows with processing states |
| 7. receipt + transaction system | `a2144d6` | Success screen, receipt, unique transaction numbers, New Transaction reset |
| 8. bug fixes/refactoring | `d4605f2` | Fixed the two issues found by `npm run lint` (see below) |
| 9. verification | `15084e3` | Headless-browser end-to-end suite (76 checks) + screenshots |
| 10. documentation | `9d56639` | README |
| 11. bug fixes | `7d393d8` | E2E now waits for styles before measuring touch targets |

Since this was developed individually, work was committed directly to `main` in
small, reviewable stages. No commits, branches, pull requests, or reviewers were
fabricated — the log above is the actual history.

## Group Members

| Name | Role |
| ---- | ---- |
| *(add your name here)* | Developer |

## Contributions

All development stages above were completed by the developer with AI assistance
(documented below). If this becomes group work, update the table above and note
who handled each stage here.

## AI Development Documentation

### Tools used

- **Claude Code** (AI pair programmer) was used throughout development.
- The full IT415 exam specification was provided as the prompt; the AI generated
  the project structure and code, which was then reviewed, compiled, and tested
  stage by stage.

### AI prompts

The main prompt was the complete exam specification (product list and prices,
screen-by-screen requirements, validation rules, test cases, and acceptance
checklist). Follow-up prompts included:

- "Type-check, lint, and run the production build; fix any errors instead of
  ignoring them."
- "Verify the exam test cases against the actual utility functions."
- "Drive the real app in a headless browser and walk every exam test case."
- "Fix the remaining e2e failures and explain the root cause."

### AI-generated code

The AI generated all application code: types (`lib/types.ts`), product catalog
(`lib/products.ts`), pricing/validation utilities (`lib/utils.ts`), localStorage
store (`lib/storage.ts`), the screen state machine (`components/POSKiosk.tsx`),
every screen component, and the verification scripts.

### Problems found and changes made after evaluating AI output

None of the AI-generated code was assumed correct — every stage was
type-checked, linted, built, and tested. Problems found and fixed:

1. **`npm run lint` error — `react-hooks/set-state-in-effect`** (commit `d4605f2`):
   the first cart-hydration implementation called `setState` synchronously inside
   `useEffect` to load the cart from localStorage. This was replaced with a
   localStorage-backed external store consumed via `useSyncExternalStore`, which
   is SSR-safe and avoids cascading renders.
2. **`npm run lint` warning — unused `paymentMethod` state** (commit `d4605f2`):
   the state was written but never read (screens route via the `screen` state and
   the completed transaction carries the method). It was removed entirely.
3. **E2E script issues (test code, not app code)** (commit `15084e3`):
   - Mouse triple-click "select all" did not reliably replace the cash input
     value before typing, which made two cash-input assertions fail with a
     different error message than expected. Replaced with a keyboard-based
     Ctrl+A select-all, after which all cash validation checks passed against
     the real UI.
   - Two sections clicked "New Transaction" while still on the success screen;
     the button lives on the receipt screen, so the test navigated there first
     (View Receipt). 
   - Toast assertions read only the oldest toast in the stack; they now check
     all visible toasts, since toasts stay on screen for 2.2 s.
   - The touch-target measurements once ran before Tailwind CSS had compiled on
     a cold dev server (an unstyled card measured 33px instead of ~176px); the
     script now waits until the card is actually styled before measuring
     (commit `7d393d8`).
4. **Google-font download removed** (`app/layout.tsx`): the scaffold loaded
   Geist via `next/font/google`, which downloads fonts at build time. This was
   replaced with a system font stack so `npm run build` works on a machine
   without internet access (e.g., during the exam).

### Debugging/refactoring performed

- Calculation and validation logic was extracted into pure functions
  (`lib/utils.ts`) so it can be verified without a browser — `scripts/verify-logic.ts`
  runs 38 assertions against the exact functions the UI uses.
- The cart store was refactored once (see problem 1) to remove hydration effects.
- Each development stage was committed only after `tsc --noEmit` passed.

### Testing performed

- `npm run verify` — 38/38 logic checks pass.
- `npm run test:e2e` — 76/76 browser checks pass in headless Microsoft Edge,
  covering every exam test case (TEST 1–14) including the exact sample
  transaction (Coffee ×2 + Sandwich ×1 + Soft Drink ×1 = ₱175), insufficient
  cash rejection, exact cash, QR, card, receipt accuracy, four unique
  transaction references, and the New Transaction reset.
- `npm run build` — production build completes with no TypeScript errors.
- `npm run lint` — clean.
- `npm run dev` and `npm start` — both serve the application.
- Responsive rendering verified at 1366×768 and 390×844 viewports.
- Manual testing checklist for the exam demo is in the section below.

### Manual acceptance checklist

Run `npm run dev`, open <http://localhost:3000>, and verify:

1. Application loads and shows 6 product cards with names and prices.
2. Tapping products adds them to the cart with toast feedback; repeated taps
   increase quantity.
3. **+** and **−** update quantity; **−** is disabled at quantity 1; the trash
   button removes an item; subtotals and total always recalculate.
4. Continue with an empty cart shows a message and does not leave the screen.
5. Order Summary shows all items, quantities, unit prices, subtotals, total;
   Back preserves everything.
6. Payment method screen shows Cash, QR Payment, and Credit/Debit Card.
7. Cash: blank / invalid / negative / insufficient (₱100 vs ₱140) are rejected
   with inline messages; ₱200 gives ₱60 change; ₱140 exact gives ₱0.00.
8. QR: placeholder + instruction shown; Confirm Payment succeeds with amount
   paid = total and change ₱0.00.
9. Card: instruction shown; Process Payment shows "Processing payment...";
   succeeds with change ₱0.00.
10. Payment Successful screen shows amount, paid, method, change, and a unique
    `TXN-YYYYMMDD-NNN` reference.
11. View Receipt shows the actual transaction data (no hard-coded values).
12. Two completed transactions get different references.
13. New Transaction clears the cart, payment data, and receipt and returns to
    item selection.
14. Layout stays large and tappable on desktop, tablet, and phone widths.
