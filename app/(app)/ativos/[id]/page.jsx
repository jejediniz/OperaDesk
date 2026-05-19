import RoleGuard from "@/components/auth/RoleGuard";
import AtivoDetalhesCliente from "@/features/ativos/AtivoDetalhesCliente";

export const metadata = {
  title: "Detalhes do ativo"
};

export default function AtivoDetalhePage() {
  return (
    <RoleGuard tiOrAdmin>
      <AtivoDetalhesCliente />
    </RoleGuard>
  );
}
