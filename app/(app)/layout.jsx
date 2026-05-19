import ProtectedShell from "@/components/layout/ProtectedShell";

export const metadata = {
  title: "Painel"
};

export default function AppLayout({ children }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
