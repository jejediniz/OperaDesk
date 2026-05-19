"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@/components/ui";
import { alterarMinhaSenha } from "@/services/api/usuariosApi";
import { useToast } from "@/contexts/toastContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export default function AlterarSenhaModal({ open, onClose }) {
  const toast = useToast();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaNova2, setSenhaNova2] = useState("");
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const { containerRef } = useFocusTrap({
    active: open,
    onClose
  });

  useEffect(() => {
    if (!open) return undefined;
    const raf = requestAnimationFrame(() => {
      document.getElementById("alterar-senha-atual")?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);

    if (senhaNova !== senhaNova2) {
      setErro("A confirmação não coincide com a nova senha.");
      return;
    }

    setSalvando(true);
    try {
      await alterarMinhaSenha({ senhaAtual, senhaNova });
      toast.success("Senha alterada com sucesso.");
      setSenhaAtual("");
      setSenhaNova("");
      setSenhaNova2("");
      onClose();
    } catch (err) {
      setErro(err?.message || "Não foi possível alterar a senha.");
    } finally {
      setSalvando(false);
    }
  }

  function handleClose() {
    if (salvando) return;
    setErro(null);
    setSenhaAtual("");
    setSenhaNova("");
    setSenhaNova2("");
    onClose();
  }

  if (!open) return null;

  return (
    <div className="edit-modal-overlay" role="presentation" onClick={handleClose}>
      <div
        ref={containerRef}
        className="edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alterar-senha-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="edit-modal__header">
          <div>
            <h3 id="alterar-senha-title">Alterar senha</h3>
            <p>Informe a senha atual e escolha uma nova senha forte.</p>
          </div>
          <Button variant="ghost" type="button" onClick={handleClose} disabled={salvando}>
            Fechar
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal__form">
          {erro && (
            <div role="alert" className="alert alert-error">
              {erro}
            </div>
          )}

          <Input
            id="alterar-senha-atual"
            label="Senha atual"
            name="senhaAtual"
            type="password"
            autoComplete="current-password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
          />

          <Input
            label="Nova senha"
            name="senhaNova"
            type="password"
            autoComplete="new-password"
            value={senhaNova}
            onChange={(e) => setSenhaNova(e.target.value)}
            required
          />

          <Input
            label="Confirmar nova senha"
            name="senhaNova2"
            type="password"
            autoComplete="new-password"
            value={senhaNova2}
            onChange={(e) => setSenhaNova2(e.target.value)}
            required
          />

          <div className="edit-modal__actions">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
