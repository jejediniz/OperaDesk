"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import { useToast } from "@/contexts/toastContext";
import { Button, Input, Card } from "@/components/ui";
import AlternarTema from "@/components/layout/AlternarTema";
import AppShellLoading from "@/components/layout/AppShellLoading";

export default function Login() {
  const { login, estaAutenticado, carregando, erro } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroLocal, setErroLocal] = useState(null);

  const from = searchParams.get("from") || "/";

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !senha) {
      setErroLocal("Informe email e senha");
      return;
    }

    setErroLocal(null);
    const sucesso = await login(email, senha);

    if (sucesso) {
      toast.success("Login realizado com sucesso.");
    }
  }

  useEffect(() => {
    if (!carregando && estaAutenticado) {
      router.replace(from);
    }
  }, [estaAutenticado, carregando, router, from]);

  if (carregando && !estaAutenticado) {
    return <AppShellLoading variant="login" />;
  }

  return (
    <>
      <header className="login-header">
        <div className="login-header__inner">
          <div className="app-header__top app-header__top--login-brand">
            <div className="app-header__top-left" aria-hidden="true" />
            <Link
              href="/"
              className="app-header__brand app-header__brand--center"
              aria-label="OperaDesk, ir ao início"
            >
              <span className="app-header__logo-scale">
                <Image
                  src="/img/operadesk-wordmark-dark-ui.png"
                  width={2515}
                  height={689}
                  alt=""
                  aria-hidden="true"
                  className="brand-logo brand-logo--header-center"
                  sizes="(max-width: 768px) min(70vw, 280px) 320px"
                  priority
                />
              </span>
            </Link>
            <div className="app-header__actions login-header__actions">
              <div className="theme-switch-field">
                <span className="theme-switch-field__label" aria-hidden>
                  Escuro
                </span>
                <AlternarTema className="theme-switch--login" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="login-layout">
        <h1 className="sr-only">OperaDesk</h1>
        <Card className="auth-card">
          <h2>Login</h2>
          <p>Informe suas credenciais para acessar o ambiente de chamados.</p>

          {(erroLocal || erro) && (
            <div role="status" aria-live="polite" className="alert alert-error">
              {erroLocal || erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Senha"
              type="password"
              name="senha"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            <div className="auth-actions">
              <Button type="submit" disabled={carregando}>
                {carregando ? "Entrando..." : "Entrar"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
