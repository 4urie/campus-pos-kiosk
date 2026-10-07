import type { ToastMessage } from "@/lib/types";

export default function Toasts({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-3 px-4"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          data-testid="toast"
          className="animate-toast-in rounded-2xl bg-slate-900/95 px-6 py-4 text-lg font-semibold text-white shadow-xl"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
