import RoleGuard from "@/components/auth/RoleGuard";
import UsuarioNovo from "@/features/usuarios/UsuarioNovo";

export const metadata = {
  title: "Novo usuário"
};

export default function UsuarioNovoPage() {
  return (
    <RoleGuard adminOnly>
      <UsuarioNovo />
    </RoleGuard>
  );
}
