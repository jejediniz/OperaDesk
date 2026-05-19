"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Button } from "@/components/ui";

const ConfirmContext = createContext(null);

const INITIAL_STATE = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "Confirmar",
  cancelLabel: "Cancelar",
  variant: "danger",
  resolve: null
};

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(INITIAL_STATE);

  const close = useCallback(
    (result) => {
      if (dialog.resolve) {
        dialog.resolve(result);
      }
      setDialog(INITIAL_STATE);
    },
    [dialog]
  );

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialog({
        open: true,
        title: options.title || "Confirmar ação",
        description: options.description || "Deseja continuar?",
        confirmLabel: options.confirmLabel || "Confirmar",
        cancelLabel: options.cancelLabel || "Cancelar",
        variant: options.variant || "danger",
        resolve
      });
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {dialog.open && (
        <div className="confirm-overlay" role="presentation">
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
          >
            <h2 id="confirm-title">{dialog.title}</h2>
            <p id="confirm-description">{dialog.description}</p>
            <div className="confirm-dialog__actions">
              <Button variant="secondary" onClick={() => close(false)}>
                {dialog.cancelLabel}
              </Button>
              <Button variant={dialog.variant} onClick={() => close(true)}>
                {dialog.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error("useConfirm deve ser usado dentro de ConfirmProvider");
  }

  return context;
}
