import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((message, options = {}) => {
    const id = ++toastId;
    const toast = {
      id,
      message,
      type: options.type || "info",
      title: options.title || null,
      duration: options.duration ?? 3200,
    };

    setToasts((current) => [...current, toast]);

    if (toast.duration > 0) {
      const timer = window.setTimeout(() => removeToast(id), toast.duration);
      timersRef.current.set(id, timer);
    }
  }, [removeToast]);

  const api = useMemo(
    () => ({
      show: pushToast,
      success: (message, options) => pushToast(message, { ...options, type: "success" }),
      error: (message, options) => pushToast(message, { ...options, type: "error" }),
      info: (message, options) => pushToast(message, { ...options, type: "info" }),
      remove: removeToast,
    }),
    [pushToast, removeToast]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            <div className="toast__body">
              {toast.title && <strong>{toast.title}</strong>}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              className="toast__close"
              onClick={() => removeToast(toast.id)}
              aria-label="Fechar notificação"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }

  return context;
}
