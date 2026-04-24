"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cabecalho from "../componentes/Cabecalho";
import Container from "../componentes/Container";
import Rodape from "../componentes/Rodape";
import { useAuth } from "../contextos/authContext";

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
    return (
      <div className="center-page">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Cabecalho />
      <Container className="app-main">{children}</Container>
      <Rodape />
    </div>
  );
}
