"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ATALHOS = [
  { tecla: "N", descricao: "Abrir um novo chamado" },
  { tecla: "/", descricao: "Focar o campo de busca da tela" },
  { tecla: "?", descricao: "Mostrar/esconder esta ajuda" },
  { tecla: "Esc", descricao: "Fechar diálogos e menus abertos" },
];

function elementoEhEditavel(target) {
  if (!target) return false;
  const tag = target.tagName;
  if (target.isContentEditable) return true;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function focarBusca() {
  const seletor = [
    'input[type="search"]',
    'input[placeholder*="usc" i]',
    'input[name*="busc" i]',
    'input[aria-label*="busc" i]',
  ].join(", ");
  const alvo = document.querySelector(seletor);
  if (alvo && typeof alvo.focus === "function") {
    alvo.focus();
    if (typeof alvo.select === "function") alvo.select();
    return true;
  }
  return false;
}

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [ajudaAberta, setAjudaAberta] = useState(false);

  const fecharAjuda = useCallback(() => setAjudaAberta(false), []);

  useEffect(() => {
    function handle(event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (elementoEhEditavel(event.target)) return;

      const tecla = event.key;

      if (tecla === "?" || (event.shiftKey && tecla === "/")) {
        event.preventDefault();
        setAjudaAberta((aberta) => !aberta);
        return;
      }

      if (tecla === "/") {
        if (focarBusca()) {
          event.preventDefault();
        }
        return;
      }

      if (tecla === "n" || tecla === "N") {
        event.preventDefault();
        router.push("/abrir-chamado");
        return;
      }

      if (tecla === "Escape" && ajudaAberta) {
        event.preventDefault();
        setAjudaAberta(false);
      }
    }

    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [ajudaAberta, router]);

  if (!ajudaAberta) return null;

  return (
    <div
      className="shortcut-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Atalhos de teclado"
      onClick={fecharAjuda}
    >
      <div className="shortcut-dialog" onClick={(e) => e.stopPropagation()}>
        <header className="shortcut-dialog__header">
          <h3>Atalhos de teclado</h3>
          <button
            type="button"
            className="shortcut-dialog__close"
            aria-label="Fechar"
            onClick={fecharAjuda}
          >
            ×
          </button>
        </header>
        <ul className="shortcut-list">
          {ATALHOS.map((atalho) => (
            <li key={atalho.tecla}>
              <kbd>{atalho.tecla}</kbd>
              <span>{atalho.descricao}</span>
            </li>
          ))}
        </ul>
        <p className="shortcut-dialog__hint">
          Os atalhos não disparam enquanto você está digitando em campos de texto.
        </p>
      </div>
    </div>
  );
}
