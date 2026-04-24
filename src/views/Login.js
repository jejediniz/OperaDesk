import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../contextos/authContext";
import { useToast } from "../contextos/toastContext";
import { Button, Input, Card } from "../components/ui";
import AlternarTema from "../componentes/AlternarTema";

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
    return (
      <div className="center-page">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      {/* CABEÇALHO DO LOGIN (SEM BOTÕES) */}
      <header className="login-header">
        <div className="login-header__row">
          <div className="login-header__brand">
            <span className="login-header__logo-scale">
              <img
                src="/img/simbolo%20-%20fundo%20transparente.png"
                alt="OperaDesk"
                className="brand-logo brand-logo--login"
              />
            </span>
            <p>Entre para acessar a central de chamados.</p>
          </div>
          <div className="login-header__tools">
            <span className="theme-switch-field__label" aria-hidden>
              Escuro
            </span>
            <AlternarTema className="theme-switch--login" />
          </div>
        </div>
      </header>

      <div className="login-layout">
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
