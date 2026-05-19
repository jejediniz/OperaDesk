import RoleGuard from "@/components/auth/RoleGuard";
import AtivosView from "@/features/ativos/AtivosView";

export const metadata = {
  title: "Patrimônio"
};

export default function AtivosPage() {
  return (
    <RoleGuard tiOrAdmin>
      <AtivosView />
    </RoleGuard>
  );
}
