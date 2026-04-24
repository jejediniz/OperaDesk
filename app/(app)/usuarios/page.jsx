"use client";

import RoleGuard from "../../../src/components/RoleGuard";
import Usuarios from "../../../src/views/Usuarios";

export default function UsuariosPage() {
  return (
    <RoleGuard adminOnly>
      <Usuarios />
    </RoleGuard>
  );
}
