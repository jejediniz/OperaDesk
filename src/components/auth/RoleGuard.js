"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";

export default function RoleGuard({ children, adminOnly = false, tiOrAdmin = false }) {
  const { usuario } = useAuth();
  const router = useRouter();

  const isAdmin = usuario?.admin === true;
  const isTi = usuario?.tipo === "ti";
  const allowed = adminOnly ? isAdmin : tiOrAdmin ? isTi || isAdmin : true;

  useEffect(() => {
    if (!allowed) {
      router.replace("/");
    }
  }, [allowed, router]);

  if (!allowed) {
    return (
      <div className="center-page">
        <div className="loading">Redirecionando...</div>
      </div>
    );
  }

  return children;
}
