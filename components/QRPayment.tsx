"use client";

import { useState } from "react";
import { ArrowLeft, QrCode } from "lucide-react";
import { formatPeso } from "@/lib/utils";

/** Deterministic pseudo-QR pattern (visual placeholder only). */
function SimulatedQRCode() {
  const SIZE = 13;
  const cells: boolean[] = [];
  let seed = 20261007;
  for (let i = 0; i < SIZE * SIZE; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push(seed % 3 !== 0);
  }

  return (
    <div className="relative mx-auto w-full max-w-56 overflow-hidden rounded-2xl border-4 border-slate-900 bg-white p-2">
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
        role="img"
        aria-label="Simulated QR code placeholder"
      >
        {cells.map((dark, i) => (
          <div key={i} className={`aspect-square ${dark ? "bg-slate-900" : "bg-white"}`} />
        ))}
      </div>
      {/* Finder squares so the placeholder reads as a QR code */}
      {["left-1 top-1", "right-1 top-1", "left-1 bottom-1"].map((position) => (
        <div
          key={position}
          className={`absolute flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 ${position}`}
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-white">
            <div className="h-2.5 w-2.5 rounded-[2px] bg-slate-900" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface QRPaymentProps {
  total: number;
  onBack: () => void;
  onConfirm: () => void;
}

export default function QRPayment({ total, onBack, onConfirm }: QRPaymentProps) {
  const [processing, setProcessing] = useState(false);

  function handleConfirm() {
    setProcessing(true);
    window.setTimeout(onConfirm, 1000);
  }

  return (
    <div data-testid="screen-qr" className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">QR Payment</h2>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-6 py-4 shadow-sm">
          <span className="flex items-center gap-3 text-lg font-extrabold text-slate-800">
            <QrCode className="h-6 w-6 text-violet-700" aria-hidden="true" />
            Total Amount
          </span>
          <span className="text-2xl font-black text-brand-800" data-testid="qr-total">
            {formatPeso(total)}
          </span>
        </div>

        <div className="mt-6 flex flex-col items-center gap-5 rounded-2xl border border-slate-200/90 bg-white p-6 text-center shadow-sm">
          <SimulatedQRCode />
          <p className="text-base font-semibold leading-relaxed text-slate-700">
            Scan the QR code using your supported payment application.
          </p>
          <p className="rounded-full bg-violet-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-violet-700">
            Simulated QR — no real payment is collected
          </p>
        </div>

        <button
          type="button"
          data-testid="qr-confirm"
          onClick={handleConfirm}
          disabled={processing}
          className="touch-ripple mt-6 flex h-16 w-full select-none items-center justify-center rounded-2xl bg-brand-600 text-xl font-extrabold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 disabled:opacity-60"
        >
          {processing ? "Confirming payment..." : "Confirm Payment"}
        </button>

        <button
          type="button"
          data-testid="back-button"
          onClick={onBack}
          disabled={processing}
          className="touch-ripple mt-4 flex h-16 w-full select-none items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-xl font-extrabold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto sm:px-10"
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
          Back
        </button>
      </div>
    </div>
  );
}
