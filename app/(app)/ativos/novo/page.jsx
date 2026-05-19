import RoleGuard from "@/components/auth/RoleGuard";
import AtivoForm from "@/features/ativos/AtivoForm";

export const metadata = {
  title: "Novo ativo"
};

export default function NovoAtivoPage() {
  return (
    <RoleGuard tiOrAdmin>
      <AtivoForm modo="novo" />
    </RoleGuard>
  );
}
