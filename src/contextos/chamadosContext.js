import { createContext, useContext, useCallback, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { useAuth } from "./authContext";
import {
  listarChamados,
  criarChamado,
  atualizarChamado,
  excluirChamado
} from "../services/chamadosApi";

const ChamadosContext = createContext(null);

export const CHAMADOS_QUERY_KEY = ["chamados", "listagem"];

function useChamadosListQuery({ page = 1, limit = 200 } = {}) {
  const { usuario } = useAuth();

  return useQuery({
    queryKey: [...CHAMADOS_QUERY_KEY, { page, limit, userId: usuario?.id }],
    queryFn: () => listarChamados({ page, limit }),
    enabled: Boolean(usuario),
    staleTime: 15_000
  });
}

export function ChamadosProvider({ children }) {
  const queryClient = useQueryClient();
  const [chamadoEmEdicao, setChamadoEmEdicao] = useState(null);

  const listagem = useChamadosListQuery({ page: 1, limit: 200 });

  const invalidarChamados = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: CHAMADOS_QUERY_KEY });
  }, [queryClient]);

  const criarMutation = useMutation({
    mutationFn: criarChamado,
    onSuccess: invalidarChamados
  });

  const atualizarMutation = useMutation({
    mutationFn: ({ id, dados }) => atualizarChamado(id, dados),
    onSuccess: invalidarChamados
  });

  const excluirMutation = useMutation({
    mutationFn: excluirChamado,
    onSuccess: invalidarChamados
  });

  const criarChamadoHandler = useCallback(
    (dados) => criarMutation.mutateAsync(dados),
    [criarMutation]
  );

  const atualizarChamadoHandler = useCallback(
    (id, dados) => atualizarMutation.mutateAsync({ id, dados }),
    [atualizarMutation]
  );

  const excluirChamadoHandler = useCallback(
    (id) => excluirMutation.mutateAsync(id),
    [excluirMutation]
  );

  const value = useMemo(
    () => ({
      chamados: listagem.data?.items ?? [],
      meta: listagem.data?.meta ?? null,
      carregando: listagem.isLoading || listagem.isFetching,
      erro: listagem.error?.message ?? null,
      chamadoEmEdicao,
      setChamadoEmEdicao,
      criarChamado: criarChamadoHandler,
      atualizarChamado: atualizarChamadoHandler,
      excluirChamado: excluirChamadoHandler,
      recarregar: () => listagem.refetch()
    }),
    [
      listagem.data,
      listagem.isLoading,
      listagem.isFetching,
      listagem.error,
      listagem.refetch,
      chamadoEmEdicao,
      criarChamadoHandler,
      atualizarChamadoHandler,
      excluirChamadoHandler
    ]
  );

  return (
    <ChamadosContext.Provider value={value}>{children}</ChamadosContext.Provider>
  );
}

export function useChamados() {
  const ctx = useContext(ChamadosContext);
  if (!ctx) {
    throw new Error("useChamados deve ser usado dentro de ChamadosProvider");
  }
  return ctx;
}
