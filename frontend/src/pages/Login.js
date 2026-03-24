import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contextos/authContext";
import { Button, Input, Card } from "../components/ui";

export default function Login() {
  const { login, estaAutenticado, carregando, erro } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroLocal, setErroLocal] = useState(null);

  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !senha) {
      setErroLocal("Informe email e senha");
      return;
    }

    setErroLocal(null);
    await login(email, senha);
  }

  useEffect(() => {
    if (!carregando && estaAutenticado) {
      navigate(from, { replace: true });
    }
  }, [estaAutenticado, carregando, navigate, from]);

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
        <img
          src="/img/logo.png"
          alt="Deskora"
          className="brand-logo brand-logo--login"
        />
        <p>Bem-vindo novamente! Entre para acompanhar e resolver demandas.</p>
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
