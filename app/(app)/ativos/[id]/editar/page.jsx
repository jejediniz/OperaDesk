import RoleGuard from "@/components/auth/RoleGuard";
import EditarAtivoCliente from "@/features/ativos/EditarAtivoCliente";

export const metadata = {
  title: "Editar ativo"
};

export default function EditarAtivoPage() {
  return (
    <RoleGuard tiOrAdmin>
      <EditarAtivoCliente />
    </RoleGuard>
  );
}
