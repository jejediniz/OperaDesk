"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import AtivoDetalhesCliente from "@/features/ativos/AtivoDetalhesCliente";

export default function AtivoDetalhePage() {
  return (
    <RoleGuard tiOrAdmin>
      <AtivoDetalhesCliente />
    </RoleGuard>
  );
}
