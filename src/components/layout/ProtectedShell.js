"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cabecalho from "./Cabecalho";
import Container from "./Container";
import Rodape from "./Rodape";
import KeyboardShortcuts from "./KeyboardShortcuts";
import AppShellLoading from "./AppShellLoading";
import MainContentReveal from "./MainContentReveal";
import RouteAnnouncer from "./RouteAnnouncer";
import { useAuth } from "@/contexts/authContext";

export default function ProtectedShell({ children }) {
  const { carregando, estaAutenticado } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !estaAutenticado) {
      router.replace(`/login?from=${encodeURIComponent(pathname || "/")}`);
    }
  }, [carregando, estaAutenticado, pathname, router]);

  if (carregando || !estaAutenticado) {
    return <AppShellLoading />;
  }

  return (
    <div className="app-shell">
      <RouteAnnouncer />
      <Cabecalho />
      <Container className="app-main">
        <MainContentReveal>{children}</MainContentReveal>
      </Container>
      <Rodape />
      <KeyboardShortcuts />
    </div>
  );
}
