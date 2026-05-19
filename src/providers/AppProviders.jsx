"use client";

import { AuthProvider } from "@/contexts/authContext";
import { ChamadosProvider } from "@/contexts/chamadosContext";
import { ConfirmProvider } from "@/contexts/confirmContext";
import { QueryProvider } from "@/contexts/queryProvider";
import { ThemeProvider } from "@/contexts/themeContext";
import { ToastProvider } from "@/contexts/toastContext";

export default function AppProviders({ children }) {
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
