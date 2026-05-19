"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  useAtualizarChamadoMutation,
  useCriarChamadoMutation,
  useExcluirChamadoMutation
} from "@/features/chamados/useChamadosQueries";

const ChamadosContext = createContext(null);

export function ChamadosProvider({ children }) {
  const [chamadoEmEdicao, setChamadoEmEdicao] = useState(null);

  const criarMutation = useCriarChamadoMutation();
  const atualizarMutation = useAtualizarChamadoMutation();
  const excluirMutation = useExcluirChamadoMutation();

  const criarChamado = criarMutation.mutateAsync;
  const atualizarMutateAsync = atualizarMutation.mutateAsync;
  const excluirChamado = excluirMutation.mutateAsync;

  const value = useMemo(
    () => ({
      chamadoEmEdicao,
      setChamadoEmEdicao,
      criarChamado,
      atualizarChamado: (id, dados) => atualizarMutateAsync({ id, dados }),
      excluirChamado
    }),
    [chamadoEmEdicao, atualizarMutateAsync, criarChamado, excluirChamado]
  );

  return <ChamadosContext.Provider value={value}>{children}</ChamadosContext.Provider>;
}

export function useChamados() {
  const ctx = useContext(ChamadosContext);
  if (!ctx) {
    throw new Error("useChamados deve ser usado dentro de ChamadosProvider");
  }
  return ctx;
}
