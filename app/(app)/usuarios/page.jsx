import RoleGuard from "@/components/auth/RoleGuard";
import Usuarios from "@/features/usuarios/Usuarios";

export const metadata = {
  title: "Usuários"
};

export default function UsuariosPage() {
  return (
    <RoleGuard adminOnly>
      <Usuarios />
    </RoleGuard>
  );
}
