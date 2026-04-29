"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import EditarAtivoCliente from "@/features/ativos/EditarAtivoCliente";

export default function EditarAtivoPage() {
  return (
    <RoleGuard tiOrAdmin>
      <EditarAtivoCliente />
    </RoleGuard>
  );
}
