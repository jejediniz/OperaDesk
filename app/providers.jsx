"use client";

import { AuthProvider } from "../src/contextos/authContext";
import { ChamadosProvider } from "../src/contextos/chamadosContext";
import { ConfirmProvider } from "../src/contextos/confirmContext";
import { QueryProvider } from "../src/contextos/queryProvider";
import { ThemeProvider } from "../src/contextos/themeContext";
import { ToastProvider } from "../src/contextos/toastContext";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>
              <ChamadosProvider>{children}</ChamadosProvider>
            </AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
