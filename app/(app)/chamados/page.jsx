import RoleGuard from "@/components/auth/RoleGuard";
import Chamados from "@/features/chamados/Chamados";

export const metadata = {
  title: "Gestão de chamados"
};

export default function ChamadosPage() {
  return (
    <RoleGuard tiOrAdmin>
      <Chamados />
    </RoleGuard>
  );
}
