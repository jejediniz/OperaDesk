"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import Chamados from "@/features/chamados/Chamados";

export default function ChamadosPage() {
  return (
    <RoleGuard tiOrAdmin>
      <Chamados />
    </RoleGuard>
  );
}
