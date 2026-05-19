"use client";

import { useEffect } from "react";
import { Button, Card } from "@/components/ui";

function mensagemDeErro(error) {
  if (error == null) return "Erro desconhecido";

  if (typeof error === "string") {
    const t = error.trim();
    return t === "" || t === "undefined" ? "Erro desconhecido" : error;
  }

  if (error instanceof Error) {
    const msg = typeof error.message === "string" ? error.message.trim() : "";
    if (msg !== "" && msg !== "undefined") return error.message.trim();
    if (typeof error.digest === "string" && error.digest)
      return `Erro temporário (ref. ${error.digest})`;
    return "Erro desconhecido";
  }

  if (typeof error === "object") {
    const msg = typeof error.message === "string" ? error.message.trim() : "";
    if (msg !== "" && msg !== "undefined") return msg;
    if (typeof error.digest === "string" && error.digest) {
      return `Erro temporário (ref. ${error.digest})`;
    }
  }

  try {
    const s = String(error);
    if (s === "undefined" || s === "[object Object]") return "Erro desconhecido";
    return s;
  } catch {
    return "Erro desconhecido";
  }
}

export default function Error({ error, reset }) {
  useEffect(() => {
    if (error != null) {
      console.error(error);
    }
  }, [error]);

  const detalhe =
    process.env.NODE_ENV === "development"
      ? mensagemDeErro(error)
      : "Tente novamente em instantes.";

  return (
    <div className="center-page login-layout">
      <Card className="auth-card">
        <h2>Algo deu errado</h2>
        <p>{detalhe}</p>
        <div className="auth-actions">
          <Button type="button" onClick={() => reset()}>
            Tentar novamente
          </Button>
        </div>
      </Card>
    </div>
  );
}
