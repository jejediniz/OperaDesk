"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import {
  useAtualizarChamadoMutation,
  useChamadosQuery,
  useExcluirChamadoMutation,
  useTecnicosQuery
} from "@/features/chamados/useChamadosQueries";
import { STATUS_FECHADOS } from "@/constants/chamados";
import { useChamadosMenuControl } from "./useChamadosMenuControl";
import { useChamadoFiltros } from "./useChamadoFiltros";
import { useChamadoAcoes } from "./useChamadoAcoes";

const FORM_INICIAL = {
  titulo: "",
  descricao: "",
  prioridade: "media",
  tecnicoId: "",
  setor: "",
  status: "aberto"
};

export function useChamadosGestao() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.admin === true;
  const isTi = usuario?.tipo === "ti";
  const podeDefinirPrioridade = isTi;

  const [selecionados, setSelecionados] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [chamadoConversa, setChamadoConversa] = useState(null);
  const [erro, setErro] = useState(null);

  const {
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
  } = useChamadoFiltros();

  const atualizarMutation = useAtualizarChamadoMutation();
  const excluirMutation = useExcluirChamadoMutation();
  const tecnicosQuery = useTecnicosQuery();
  const chamadosQuery = useChamadosQuery({
    page: pagina,
    limit: limite,
    q: buscaDebounced || undefined
  });

  const chamados = useMemo(() => chamadosQuery.data?.items ?? [], [chamadosQuery.data]);
  const meta = chamadosQuery.data?.meta ?? null;
  const carregando = chamadosQuery.isLoading || chamadosQuery.isFetching;
  const tecnicos = useMemo(
    () => (tecnicosQuery.data ?? []).filter((u) => u.tipo === "ti"),
    [tecnicosQuery.data]
  );

  const chamadosFiltrados = useMemo(() => aplicarFiltros(chamados), [aplicarFiltros, chamados]);

  useEffect(() => {
    if (chamadosQuery.error) {
      setErro(chamadosQuery.error.message || "Erro ao carregar chamados");
    }
  }, [chamadosQuery.error]);

  const { menuAbertoId, menuRef, menuButtonRefs, menuItemRefs, fecharMenu, alternarMenu } =
    useChamadosMenuControl();

  const acoes = useChamadoAcoes({
    usuario,
    atualizarMutation,
    excluirMutation,
    setErro
  });

  useEffect(() => {
    setSelecionados((atual) =>
      atual.filter((id) => chamadosFiltrados.some((chamado) => chamado.id === id))
    );
  }, [chamadosFiltrados]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!editandoId || !form.titulo || !form.descricao) return;

    setErro(null);
    try {
      const payload = {
        titulo: form.titulo,
        descricao: form.descricao,
        tecnicoId: form.tecnicoId || undefined,
        setor: form.setor || undefined,
        status: form.status || "aberto"
      };
      if (podeDefinirPrioridade) {
        payload.prioridade = form.prioridade;
      }

      await atualizarMutation.mutateAsync({ id: editandoId, dados: payload });
      setForm(FORM_INICIAL);
      setEditandoId(null);
    } catch (error) {
      setErro(error.message || "Erro ao salvar chamado");
    }
  }

  function editarChamado(chamado) {
    setEditandoId(chamado.id);
    setForm({
      titulo: chamado.titulo,
      descricao: chamado.descricao,
      prioridade: chamado.prioridade,
      status: chamado.status,
      tecnicoId: chamado.tecnico?.id || "",
      setor: chamado.setor || ""
    });
  }

  function fecharEdicao() {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setErro(null);
  }

  function alternarSelecao(id) {
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
    );
  }

  function alternarSelecionarTodos() {
    if (!chamadosFiltrados.length) return;

    const todos = chamadosFiltrados.every((c) => selecionados.includes(c.id));

    setSelecionados((atual) => {
      if (todos) {
        return atual.filter((id) => !chamadosFiltrados.some((c) => c.id === id));
      }
      const ids = new Set(atual);
      chamadosFiltrados.forEach((c) => ids.add(c.id));
      return Array.from(ids);
    });
  }

  function limparFiltrosESelecao() {
    limparFiltros();
    setSelecionados([]);
  }

  const todosSelecionados =
    chamadosFiltrados.length > 0 && chamadosFiltrados.every((c) => selecionados.includes(c.id));

  const quantidadeConcluiveis = chamadosFiltrados.filter(
    (c) => selecionados.includes(c.id) && !STATUS_FECHADOS.includes(c.status)
  ).length;

  return {
    isAdmin,
    isTi,
    podeDefinirPrioridade,
    erro,
    form,
    editandoId,
    chamadoConversa,
    setChamadoConversa,
    busca,
    setBusca,
    statusFiltro,
    setStatusFiltro,
    limite,
    setLimite,
    filtrosAtivos,
    limparFiltrosESelecao,
    irParaPagina,
    pagina,
    chamadosFiltrados,
    chamados,
    meta,
    carregando,
    tecnicos,
    chamadosQuery,
    selecionados,
    menuAbertoId,
    menuRef,
    menuButtonRefs,
    menuItemRefs,
    fecharMenu,
    alternarMenu,
    acoes,
    handleChange,
    handleSubmit,
    editarChamado,
    fecharEdicao,
    alternarSelecao,
    alternarSelecionarTodos,
    setSelecionados,
    todosSelecionados,
    quantidadeConcluiveis
  };
}
