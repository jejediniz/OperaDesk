"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ROUTE_LABELS = [
  ["/usuarios/novo", "Novo usuário"],
  ["/usuarios", "Usuários"],
  ["/abrir-chamado", "Abrir chamado"],
  ["/meus-chamados", "Meus chamados"],
  ["/chamados", "Gestão de chamados"]
];

function labelForPath(pathname) {
  if (!pathname) return "OperaDesk";
  if (pathname === "/") return "Painel";
  const match = ROUTE_LABELS.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  return match ? match[1] : "OperaDesk";
}

export default function RouteAnnouncer() {
  const pathname = usePathname();
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(labelForPath(pathname));
  }, [pathname]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {label ? `Página: ${label}` : ""}
    </div>
  );
}
