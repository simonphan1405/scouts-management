"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title: string;
  description?: React.ReactNode;
  duration?: number; // milliseconds
}

export interface ToastItem extends Required<
  Pick<ToastOptions, "id" | "type" | "title">
> {
  description?: React.ReactNode;
  duration: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Global event bus for imperative toast calls outside of React component tree
type ToastListener = (toast: ToastOptions) => void;
type DismissListener = (id: string) => void;
const toastListeners = new Set<ToastListener>();
const dismissListeners = new Set<DismissListener>();

/**
 * Global imperative toast function
 */
export function toast(options: ToastOptions) {
  toastListeners.forEach((listener) => listener(options));
}

toast.success = (
  title: string,
  description?: React.ReactNode,
  duration?: number,
) => {
  toast({ type: "success", title, description, duration });
};

toast.warning = (
  title: string,
  description?: React.ReactNode,
  duration?: number,
) => {
  toast({ type: "warning", title, description, duration });
};

// Alias for failure
toast.failure = (
  title: string,
  description?: React.ReactNode,
  duration?: number,
) => {
  toast({ type: "warning", title, description, duration });
};

toast.error = (
  title: string,
  description?: React.ReactNode,
  duration?: number,
) => {
  toast({ type: "error", title, description, duration });
};

toast.info = (
  title: string,
  description?: React.ReactNode,
  duration?: number,
) => {
  toast({ type: "info", title, description, duration });
};

toast.dismiss = (id: string) => {
  dismissListeners.forEach((listener) => listener(id));
};

export function useToast() {
  const context = useContext(ToastContext);
  return {
    toast,
    toasts: context?.toasts ?? [],
    dismiss: context?.dismissToast ?? toast.dismiss,
    clearAll: context?.clearAll ?? (() => {}),
  };
}

const DEFAULT_DURATION = 4500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((opts: ToastOptions) => {
    const id =
      opts.id ||
      `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = {
      id,
      type: opts.type || "info",
      title: opts.title,
      description: opts.description,
      duration: opts.duration ?? DEFAULT_DURATION,
    };

    setToasts((prev) => {
      // Prevent excessive duplicate toasts with same title and description within a short timeframe
      const existingIdx = prev.findIndex(
        (t) =>
          t.title === newToast.title && t.description === newToast.description,
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = newToast;
        return updated;
      }
      return [...prev, newToast];
    });

    return id;
  }, []);

  useEffect(() => {
    const handleAdd = (opts: ToastOptions) => {
      addToast(opts);
    };
    const handleDismiss = (id: string) => {
      dismissToast(id);
    };

    toastListeners.add(handleAdd);
    dismissListeners.add(handleDismiss);

    return () => {
      toastListeners.delete(handleAdd);
      dismissListeners.delete(handleDismiss);
    };
  }, [addToast, dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast, clearAll }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

const TOAST_ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const TOAST_STYLES: Record<
  ToastType,
  {
    container: string;
    iconColor: string;
    progressBar: string;
    badge: string;
    badgeText: string;
  }
> = {
  success: {
    container:
      "border-emerald-500/40 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    progressBar: "bg-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300/40",
    badgeText: "Thành công",
  },
  warning: {
    container:
      "border-amber-500/40 bg-amber-50/95 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100 shadow-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    progressBar: "bg-amber-500",
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-300/40",
    badgeText: "Cần kiểm tra",
  },
  error: {
    container:
      "border-rose-500/40 bg-rose-50/95 dark:bg-rose-950/90 text-rose-950 dark:text-rose-100 shadow-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    progressBar: "bg-rose-500",
    badge:
      "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 border-rose-300/40",
    badgeText: "Sự cố",
  },
  info: {
    container:
      "border-sky-500/40 bg-sky-50/95 dark:bg-sky-950/90 text-sky-950 dark:text-sky-100 shadow-sky-500/10",
    iconColor: "text-sky-600 dark:text-sky-400",
    progressBar: "bg-sky-500",
    badge:
      "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 border-sky-300/40",
    badgeText: "Thông tin",
  },
};

function ToastMessage({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const Icon = TOAST_ICONS[item.type];
  const style = TOAST_STYLES[item.type];
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const remainingTimeRef = useRef(item.duration);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (item.duration <= 0) return;

    let animFrame: number;

    const tick = (now: number) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
      }
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      if (!isHovered) {
        remainingTimeRef.current -= delta;
        const pct = Math.max(
          0,
          (remainingTimeRef.current / item.duration) * 100,
        );
        setProgress(pct);

        if (remainingTimeRef.current <= 0) {
          onDismiss(item.id);
          return;
        }
      }

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrame);
      lastTickRef.current = null;
    };
  }, [item.id, item.duration, isHovered, onDismiss]);

  return (
    <div
      role="alert"
      aria-live={item.type === "error" ? "assertive" : "polite"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border p-3.5 sm:p-4 shadow-xl backdrop-blur-md transition-all duration-300 ease-out animate-in fade-in-0 slide-in-from-top-3 sm:slide-in-from-bottom-3 ${style.container}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${style.iconColor}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold tracking-tight truncate leading-tight">
              {item.title}
            </h4>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border leading-none ${style.badge}`}
            >
              {style.badgeText}
            </span>
          </div>

          {item.description && (
            <div className="text-xs opacity-90 leading-relaxed font-medium wrap-break-word">
              {item.description}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          className="shrink-0 p-1 -mr-1 -mt-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Đóng thông báo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {item.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className={`h-full transition-all ease-linear ${style.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Thông báo hệ thống"
      className="fixed z-9999 top-4 right-4 sm:bottom-4 sm:top-auto sm:right-4 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] pointer-events-none"
    >
      {toasts.map((item) => (
        <ToastMessage key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
