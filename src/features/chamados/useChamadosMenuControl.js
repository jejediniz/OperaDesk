"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useChamadosMenuControl() {
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const menuRef = useRef(null);
  const menuButtonRefs = useRef({});
  const menuItemRefs = useRef({});

  const fecharMenu = useCallback(() => {
    const idAtual = menuAbertoId;
    setMenuAbertoId(null);
    if (idAtual && menuButtonRefs.current[idAtual]) {
      menuButtonRefs.current[idAtual].focus();
    }
  }, [menuAbertoId]);

  const alternarMenu = useCallback((id) => {
    setMenuAbertoId((atual) => (atual === id ? null : id));
  }, []);

  useEffect(() => {
    if (!menuAbertoId) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        fecharMenu();
      }
    }

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        fecharMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    const primeiroItem = menuItemRefs.current[menuAbertoId];
    if (primeiroItem) {
      primeiroItem.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [menuAbertoId, fecharMenu]);

  return {
    menuAbertoId,
    menuRef,
    menuButtonRefs,
    menuItemRefs,
    fecharMenu,
    alternarMenu
  };
}
