"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarChamados,
  listarInteracoesChamado,
  criarInteracaoChamado,
  criarChamado,
  atualizarChamado,
  excluirChamado,
  obterMetricasChamados
} from "@/services/api/chamadosApi";
import { listarTecnicos } from "@/services/api/usuariosApi";

export const CHAMADOS_QUERY_KEY = ["chamados"];
export const TECNICOS_QUERY_KEY = ["usuarios", "tecnicos"];
export const CHAMADOS_METRICS_QUERY_KEY = ["chamados", "metrics"];
export const INTERACOES_QUERY_KEY = (chamadoId) => ["chamados", "interacoes", String(chamadoId)];

const CHAMADOS_PREFIX = { queryKey: CHAMADOS_QUERY_KEY };

function snapshotChamados(queryClient) {
  return queryClient.getQueriesData(CHAMADOS_PREFIX);
}

function restaurarSnapshots(queryClient, snapshots) {
  if (!snapshots) return;
  snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

function invalidarChamados(queryClient) {
  queryClient.invalidateQueries({ queryKey: CHAMADOS_QUERY_KEY });
}

export function useChamadosQuery(params = {}) {
  const { page = 1, limit = 10, enabled = true, ...filtros } = params;

  return useQuery({
    queryKey: ["chamados", "paginados", { page, limit, ...filtros }],
    queryFn: () => listarChamados({ page, limit, ...filtros }),
    enabled,
    staleTime: 30_000
  });
}

export function useChamadosMetricsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: CHAMADOS_METRICS_QUERY_KEY,
    queryFn: obterMetricasChamados,
    enabled,
    staleTime: 30_000
  });
}

export function useTecnicosQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: TECNICOS_QUERY_KEY,
    queryFn: listarTecnicos,
    enabled
  });
}

export function useInteracoesChamado(chamadoId) {
  return useQuery({
    queryKey: INTERACOES_QUERY_KEY(chamadoId),
    queryFn: () => listarInteracoesChamado(chamadoId),
    enabled: Boolean(chamadoId)
  });
}

export function useCriarInteracaoMutation(chamadoId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados) => criarInteracaoChamado(chamadoId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INTERACOES_QUERY_KEY(chamadoId)
      });
      invalidarChamados(queryClient);
    }
  });
}

export function useCriarChamadoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: criarChamado,
    onSuccess: () => invalidarChamados(queryClient)
  });
}

export function useAtualizarChamadoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }) => atualizarChamado(id, dados),
    onMutate: async ({ id, dados }) => {
      await queryClient.cancelQueries(CHAMADOS_PREFIX);
      const snapshots = snapshotChamados(queryClient);

      queryClient.setQueriesData(CHAMADOS_PREFIX, (data) => {
        if (!data || !Array.isArray(data.items)) return data;
        return {
          ...data,
          items: data.items.map((c) =>
            c.id === id ? { ...c, ...dados, updated_at: new Date().toISOString() } : c
          )
        };
      });

      return { snapshots };
    },
    onError: (_err, _vars, context) => restaurarSnapshots(queryClient, context?.snapshots),
    onSettled: () => invalidarChamados(queryClient)
  });
}

export function useExcluirChamadoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: excluirChamado,
    onMutate: async (id) => {
      await queryClient.cancelQueries(CHAMADOS_PREFIX);
      const snapshots = snapshotChamados(queryClient);

      queryClient.setQueriesData(CHAMADOS_PREFIX, (data) => {
        if (!data || !Array.isArray(data.items)) return data;
        const items = data.items.filter((c) => c.id !== id);
        const meta = data.meta
          ? { ...data.meta, total: Math.max((data.meta.total ?? items.length) - 1, 0) }
          : data.meta;
        return { ...data, items, meta };
      });

      return { snapshots };
    },
    onError: (_err, _vars, context) => restaurarSnapshots(queryClient, context?.snapshots),
    onSettled: () => invalidarChamados(queryClient)
  });
}
