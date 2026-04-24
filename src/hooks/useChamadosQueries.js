import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarChamados,
  listarInteracoesChamado,
  criarInteracaoChamado,
  criarChamado,
  atualizarChamado,
  excluirChamado
} from "../services/chamadosApi";
import {
  listarUsuarios,
  listarTecnicos,
  criarUsuario,
  excluirUsuario
} from "../services/usuariosApi";
import { CHAMADOS_QUERY_KEY } from "../contextos/chamadosContext";

export const INTERACOES_QUERY_KEY = (chamadoId) => [
  "chamados",
  "interacoes",
  String(chamadoId)
];

export const USUARIOS_QUERY_KEY = ["usuarios"];
export const TECNICOS_QUERY_KEY = ["usuarios", "tecnicos"];

export function useChamadosQuery(params = {}) {
  const { page = 1, limit = 10, enabled = true, ...filtros } = params;

  return useQuery({
    queryKey: ["chamados", "paginados", { page, limit, ...filtros }],
    queryFn: () => listarChamados({ page, limit, ...filtros }),
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
      queryClient.invalidateQueries({ queryKey: CHAMADOS_QUERY_KEY });
    }
  });
}

export function useCriarChamadoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: criarChamado,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAMADOS_QUERY_KEY })
  });
}

export function useAtualizarChamadoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }) => atualizarChamado(id, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAMADOS_QUERY_KEY })
  });
}

export function useExcluirChamadoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: excluirChamado,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAMADOS_QUERY_KEY })
  });
}

export function useUsuariosQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: USUARIOS_QUERY_KEY,
    queryFn: listarUsuarios,
    enabled
  });
}

export function useTecnicosQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: TECNICOS_QUERY_KEY,
    queryFn: listarTecnicos,
    enabled
  });
}

export function useCriarUsuarioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: criarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TECNICOS_QUERY_KEY });
    }
  });
}

export function useExcluirUsuarioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: excluirUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TECNICOS_QUERY_KEY });
    }
  });
}
