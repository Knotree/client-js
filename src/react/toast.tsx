import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icons.js";

type ToastKind = "success" | "error" | "info";

export type ToastInput = {
  id: string;
  kind: ToastKind;
  message: string;
  /** Milliseconds to live. 0 = forever (until dismissed). */
  duration?: number;
};

export type ToastApi = {
  push: (toast: Omit<ToastInput, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

const TOAST_EVENT = "knotree:toast";

function publish(toast: ToastInput) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastInput>(TOAST_EVENT, { detail: toast }));
}

export const toast = {
  success: (message: string, opts: { duration?: number } = {}) =>
    publish({ id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, kind: "success", message, duration: opts.duration ?? 4000 }),
  error: (message: string, opts: { duration?: number } = {}) =>
    publish({ id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, kind: "error", message, duration: opts.duration ?? 6000 }),
  info: (message: string, opts: { duration?: number } = {}) =>
    publish({ id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, kind: "info", message, duration: opts.duration ?? 4000 }),
  dismiss(id: string) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(`${TOAST_EVENT}:dismiss`, { detail: { id } }));
  },
  clear() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(`${TOAST_EVENT}:clear`));
  },
};

function ToastViewport() {
  const [toasts, setToasts] = useState<ToastInput[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onAdd = (event: Event) => {
      const toast = (event as CustomEvent<ToastInput>).detail;
      setToasts((prev) => [...prev, toast]);
    };
    const onDismiss = (event: Event) => {
      const { id } = (event as CustomEvent<{ id: string }>).detail;
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };
    const onClear = () => setToasts([]);
    window.addEventListener(TOAST_EVENT, onAdd);
    window.addEventListener(`${TOAST_EVENT}:dismiss`, onDismiss);
    window.addEventListener(`${TOAST_EVENT}:clear`, onClear);
    return () => {
      window.removeEventListener(TOAST_EVENT, onAdd);
      window.removeEventListener(`${TOAST_EVENT}:dismiss`, onDismiss);
      window.removeEventListener(`${TOAST_EVENT}:clear`, onClear);
    };
  }, []);

  if (typeof document === "undefined" || toasts.length === 0) return null;

  return createPortal(
    <div className="kt-toast-viewport" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={(id) => setToasts((prev) => prev.filter((x) => x.id !== id))} />
      ))}
    </div>,
    document.body,
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastInput; onDismiss: (id: string) => void }) {
  const duration = toast.duration ?? 4000;
  useEffect(() => {
    if (duration <= 0) return;
    const t = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(t);
  }, [duration, onDismiss, toast.id]);

  const iconName = toast.kind === "success" ? "check" : toast.kind === "error" ? "alert" : "info";

  return (
    <div className={`kt-toast kt-toast-${toast.kind}`} role={toast.kind === "error" ? "alert" : "status"}>
      <span className="kt-toast-icon" aria-hidden="true">
        <Icon name={iconName} width="18" />
      </span>
      <span className="kt-toast-message">{toast.message}</span>
      <button
        type="button"
        className="kt-toast-close"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <Icon name="close" width="14" />
      </button>
      {duration > 0 ? <span className="kt-toast-progress" style={{ animationDuration: `${duration}ms` }} aria-hidden="true" /> : null}
    </div>
  );
}

export function Toaster(): ReactNode {
  return <ToastViewport />;
}
