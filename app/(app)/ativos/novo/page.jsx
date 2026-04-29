"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import AtivoForm from "@/features/ativos/AtivoForm";

export default function NovoAtivoPage() {
  return (
    <RoleGuard tiOrAdmin>
      <AtivoForm modo="novo" />
    </RoleGuard>
  );
}
