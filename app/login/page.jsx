"use client";

import { Suspense } from "react";
import Login from "../../src/views/Login";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="center-page"><div className="loading">Carregando...</div></div>}>
      <Login />
    </Suspense>
  );
}
