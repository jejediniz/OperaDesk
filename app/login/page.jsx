import { Suspense } from "react";
import Login from "@/features/auth/Login";
import AppShellLoading from "@/components/layout/AppShellLoading";

export const metadata = {
  title: "Login"
};

export default function LoginPage() {
  return (
    <Suspense fallback={<AppShellLoading variant="login" />}>
      <Login />
    </Suspense>
  );
}
