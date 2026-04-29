"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import UsuarioNovo from "@/features/usuarios/UsuarioNovo";

export default function UsuarioNovoPage() {
  return (
    <RoleGuard adminOnly>
      <UsuarioNovo />
    </RoleGuard>
  );
}
