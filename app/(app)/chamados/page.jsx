"use client";

import RoleGuard from "../../../src/components/RoleGuard";
import Chamados from "../../../src/views/Chamados";

export default function ChamadosPage() {
  return (
    <RoleGuard tiOrAdmin>
      <Chamados />
    </RoleGuard>
  );
}
