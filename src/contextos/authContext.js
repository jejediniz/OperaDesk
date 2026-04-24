import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import api, { setUnauthorizedHandler } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const sessionCheckedRef = useRef(false);

  useEffect(() => {
    if (sessionCheckedRef.current) return;
    sessionCheckedRef.current = true;

    let cancelado = false;

    async function recuperarSessao() {
      try {
        const response = await api.get("/auth/me");
        if (!cancelado) {
          setUsuario(response.data.data);
        }
      } catch {
        if (!cancelado) {
          setUsuario(null);
        }
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    recuperarSessao();

    return () => {
      cancelado = true;
    };
  }, []);

  async function login(email, senha) {
    setCarregando(true);
    setErro(null);

    try {
      const response = await api.post("/auth/login", { email, senha });
      setUsuario(response.data.data);
      return true;
    } catch (error) {
      setErro(error.message || "Email ou senha inválidos");
      return false;
    } finally {
      setCarregando(false);
    }
  }

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignora erro de rede no logout — mesmo assim limpa o estado
    }
    setUsuario(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUsuario(null);
    });
  }, []);

  const estaAutenticado = Boolean(usuario);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaAutenticado,
        carregando,
        erro,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
