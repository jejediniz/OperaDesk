"use client";

import { useEffect, useRef, useState } from "react";

export function usePersistentState(chave, valorInicial) {
  const inicialRef = useRef(valorInicial);

  const [valor, setValor] = useState(() => {
    if (typeof window === "undefined") return inicialRef.current;
    try {
      const armazenado = window.localStorage.getItem(chave);
      if (armazenado === null) return inicialRef.current;
      return JSON.parse(armazenado);
    } catch {
      return inicialRef.current;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      // armazenamento indisponível — segue só em memória
    }
  }, [chave, valor]);

  return [valor, setValor];
}

export default usePersistentState;
