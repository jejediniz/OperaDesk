"use client";

import { useCallback, useEffect, useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { STATUS_FECHADOS } from "@/constants/chamados";

export function useChamadoFiltros() {
  const [pagina, setPagina] = useState(1);
  const [limite, setLimiteState] = usePersistentState("operadesk:chamados:limite", 10);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = usePersistentState(
    "operadesk:chamados:statusFiltro",
    "todos"
  );

  // Busca debounced é o que vai para o servidor (param `q`)
  const buscaDebounced = useDebouncedValue(busca.trim(), 300);

  const filtrosAtivos = [busca.trim() !== "", statusFiltro !== "todos"].filter(Boolean).length;

  const setLimite = useCallback(
    (novo) => {
      setLimiteState(novo);
      setPagina(1);
    },
    [setLimiteState]
  );

  const limparFiltros = useCallback(() => {
    setBusca("");
    setStatusFiltro("todos");
  }, [setStatusFiltro]);

  const irParaPagina = useCallback((novaPagina, totalPages) => {
    if (novaPagina < 1) return;
    if (totalPages && novaPagina > totalPages) return;
    setPagina(novaPagina);
  }, []);

  // Filtra apenas o que NÃO foi enviado ao servidor (status agrupado).
  // O backend já cuida de busca textual e demais filtros.
  const aplicarFiltros = useCallback(
    (chamados) => {
      return chamados
        .filter((chamado) => {
          if (statusFiltro === "todos") return true;
          if (statusFiltro === "concluido") {
            return STATUS_FECHADOS.includes(chamado.status);
          }
          return chamado.status === statusFiltro;
        })
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    },
    [statusFiltro]
  );

  // Reset para página 1 quando os filtros que vão ao servidor (ou tamanho de
  // página) mudam, evitando estado inválido (ex.: pedir página 5 com filtro novo).
  useEffect(() => {
    setPagina(1);
  }, [buscaDebounced, statusFiltro, limite]);

  return {
    aplicarFiltros,
    busca,
    buscaDebounced,
    filtrosAtivos,
    irParaPagina,
    limite,
    limparFiltros,
    pagina,
    setBusca,
    setLimite,
    setStatusFiltro,
    statusFiltro
  };
}
