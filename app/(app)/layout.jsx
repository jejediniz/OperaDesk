import ProtectedShell from "../../src/components/ProtectedShell";

export default function AppLayout({ children }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
