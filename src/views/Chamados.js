import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contextos/authContext";
import { useConfirm } from "../contextos/confirmContext";
import { useToast } from "../contextos/toastContext";
import {
  useChamadosQuery,
  useAtualizarChamadoMutation,
  useExcluirChamadoMutation,
  useTecnicosQuery,
} from "../hooks/useChamadosQueries";
import { Button, EmptyState, PageHeader } from "../components/ui";
import ChamadoConversationModal from "../components/chamados/ChamadoConversationModal";
import ChamadosToolbar from "./chamados/ChamadosToolbar";
import ChamadosSelectionBar from "./chamados/ChamadosSelectionBar";
import ChamadoRow from "./chamados/ChamadoRow";
import ChamadoEditModal from "./chamados/ChamadoEditModal";
import { useChamadosMenuControl } from "./chamados/useChamadosMenuControl";

const FORM_INICIAL = {
  titulo: "",
  descricao: "",
  prioridade: "media",
  tecnicoId: "",
  setor: "",
  status: "aberto",
};

export default function Chamados() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.admin === true;
  const isTi = usuario?.tipo === "ti";
  const podeDefinirPrioridade = isTi;
  const { confirm } = useConfirm();
  const toast = useToast();

  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(10);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [selecionados, setSelecionados] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [chamadoConversa, setChamadoConversa] = useState(null);
  const [erro, setErro] = useState(null);

  const chamadosQuery = useChamadosQuery({ page: pagina, limit: limite });
  const tecnicosQuery = useTecnicosQuery();
  const atualizarMutation = useAtualizarChamadoMutation();
  const excluirMutation = useExcluirChamadoMutation();

  const chamados = chamadosQuery.data?.items ?? [];
  const meta = chamadosQuery.data?.meta ?? null;
  const carregando = chamadosQuery.isLoading || chamadosQuery.isFetching;
  const tecnicos = (tecnicosQuery.data ?? []).filter((u) => u.tipo === "ti");

  useEffect(() => {
    if (chamadosQuery.error) {
      setErro(chamadosQuery.error.message || "Erro ao carregar chamados");
    }
  }, [chamadosQuery.error]);

  const {
    menuAbertoId,
    menuRef,
    menuButtonRefs,
    menuItemRefs,
    fecharMenu,
    alternarMenu,
  } = useChamadosMenuControl();

  const chamadosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return chamados
      .filter((chamado) => {
        const correspondeStatus =
          statusFiltro === "todos" ||
          (statusFiltro === "concluido"
            ? ["concluido", "fechado"].includes(chamado.status)
            : chamado.status === statusFiltro);

        const correspondeBusca =
          !termo ||
          [
            chamado.titulo,
            chamado.descricao,
            chamado.solicitante?.nome,
            chamado.tecnico?.nome,
            chamado.setor,
            chamado.id,
          ]
            .filter(Boolean)
            .some((valor) => valor.toString().toLowerCase().includes(termo));

        return correspondeStatus && correspondeBusca;
      })
      .sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
  }, [busca, chamados, statusFiltro]);

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
        status: form.status || "aberto",
      };
      if (podeDefinirPrioridade) {
        payload.prioridade = form.prioridade;
      }

      await atualizarMutation.mutateAsync({ id: editandoId, dados: payload });
      setForm(FORM_INICIAL);
      setEditandoId(null);
      toast.success("Chamado atualizado com sucesso.");
    } catch (error) {
      setErro(error.message || "Erro ao salvar chamado");
      toast.error(error.message || "Erro ao salvar chamado.");
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
      setor: chamado.setor || "",
    });
  }

  function fecharEdicao() {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setErro(null);
  }

  async function remover(id) {
    const confirmado = await confirm({
      title: "Excluir chamado",
      description: "Essa ação remove o chamado da lista. Deseja continuar?",
      confirmLabel: "Excluir",
    });
    if (!confirmado) return;

    try {
      await excluirMutation.mutateAsync(id);
      toast.success("Chamado excluído com sucesso.");
    } catch (error) {
      setErro(error.message || "Erro ao excluir chamado");
      toast.error(error.message || "Erro ao excluir chamado.");
    }
  }

  async function assumirChamado(id) {
    try {
      await atualizarMutation.mutateAsync({ id, dados: { tecnicoId: usuario.id } });
      toast.success("Chamado assumido com sucesso.");
    } catch (error) {
      setErro(error.message || "Erro ao assumir chamado");
      toast.error(error.message || "Erro ao assumir chamado.");
    }
  }

  async function concluirChamado(id) {
    const confirmado = await confirm({
      title: "Concluir chamado",
      description: "O chamado será marcado como concluído. Deseja continuar?",
      confirmLabel: "Concluir",
      variant: "primary",
    });
    if (!confirmado) return;

    try {
      await atualizarMutation.mutateAsync({ id, dados: { status: "concluido" } });
      toast.success("Chamado concluído com sucesso.");
    } catch (error) {
      setErro(error.message || "Erro ao concluir chamado");
      toast.error(error.message || "Erro ao concluir chamado.");
    }
  }

  function alternarSelecao(id) {
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
    );
  }

  function alternarSelecionarTodos() {
    if (!chamadosFiltrados.length) return;

    const todosSelecionados = chamadosFiltrados.every((c) =>
      selecionados.includes(c.id)
    );

    setSelecionados((atual) => {
      if (todosSelecionados) {
        return atual.filter(
          (id) => !chamadosFiltrados.some((c) => c.id === id)
        );
      }
      const ids = new Set(atual);
      chamadosFiltrados.forEach((c) => ids.add(c.id));
      return Array.from(ids);
    });
  }

  async function concluirSelecionados() {
    const elegiveis = chamadosFiltrados.filter(
      (c) =>
        selecionados.includes(c.id) &&
        !["concluido", "fechado"].includes(c.status)
    );
    if (!elegiveis.length) return;

    const confirmado = await confirm({
      title: "Concluir chamados selecionados",
      description: `Os ${elegiveis.length} chamados selecionados serão concluídos.`,
      confirmLabel: "Concluir",
      variant: "primary",
    });
    if (!confirmado) return;

    try {
      await Promise.all(
        elegiveis.map((c) =>
          atualizarMutation.mutateAsync({ id: c.id, dados: { status: "concluido" } })
        )
      );
      setSelecionados([]);
      toast.success("Chamados concluídos com sucesso.");
    } catch (error) {
      setErro(error.message || "Erro ao concluir chamados selecionados");
      toast.error(error.message || "Erro ao concluir chamados selecionados.");
    }
  }

  async function assumirSelecionados() {
    const elegiveis = chamadosFiltrados.filter((c) =>
      selecionados.includes(c.id)
    );
    if (!elegiveis.length) return;

    const confirmado = await confirm({
      title: "Assumir chamados selecionados",
      description: `Você será definido como responsável por ${elegiveis.length} chamado(s).`,
      confirmLabel: "Assumir",
      variant: "primary",
    });
    if (!confirmado) return;

    try {
      await Promise.all(
        elegiveis.map((c) =>
          atualizarMutation.mutateAsync({ id: c.id, dados: { tecnicoId: usuario.id } })
        )
      );
      setSelecionados([]);
      toast.success("Chamados assumidos com sucesso.");
    } catch (error) {
      setErro(error.message || "Erro ao assumir chamados selecionados");
      toast.error(error.message || "Erro ao assumir chamados selecionados.");
    }
  }

  function limparFiltros() {
    setBusca("");
    setStatusFiltro("todos");
    setSelecionados([]);
  }

  function irParaPagina(novaPagina) {
    if (novaPagina < 1) return;
    if (meta?.totalPages && novaPagina > meta.totalPages) return;
    setPagina(novaPagina);
  }

  const todosSelecionados =
    chamadosFiltrados.length > 0 &&
    chamadosFiltrados.every((c) => selecionados.includes(c.id));

  const quantidadeConcluiveis = chamadosFiltrados.filter(
    (c) =>
      selecionados.includes(c.id) &&
      !["concluido", "fechado"].includes(c.status)
  ).length;

  const filtrosAtivos = [busca.trim() !== "", statusFiltro !== "todos"].filter(
    Boolean
  ).length;

  return (
    <div>
      <PageHeader
        title="Gestão de Chamados"
        subtitle="Visualize e opere a fila de chamados com foco total na gestão."
      />

      <div>
        <div className="table-card">
          <div className="table-header">
            <div>
              <strong>Fila de chamados</strong>
              <p className="table-header__subtitle">
                Busque, filtre e execute ações com mais clareza operacional.
              </p>
            </div>
          </div>

          <ChamadosToolbar
            busca={busca}
            onBuscaChange={setBusca}
            statusFiltro={statusFiltro}
            onStatusFiltroChange={setStatusFiltro}
            limite={limite}
            onLimiteChange={(v) => {
              setLimite(v);
              setPagina(1);
            }}
            totalFiltrado={chamadosFiltrados.length}
            totalPagina={chamados.length}
            filtrosAtivos={filtrosAtivos}
            onLimparFiltros={limparFiltros}
          />

          <ChamadosSelectionBar
            selecionadosCount={selecionados.length}
            quantidadeConcluiveis={quantidadeConcluiveis}
            isTi={isTi}
            onAssumirSelecionados={assumirSelecionados}
            onConcluirSelecionados={concluirSelecionados}
          />

          <div className="management-list">
            <div className="management-list__header">
              <div className="management-list__select">
                <input
                  type="checkbox"
                  aria-label="Selecionar todos os chamados filtrados"
                  checked={todosSelecionados}
                  onChange={alternarSelecionarTodos}
                />
              </div>
              <div>Status</div>
              <div>Prioridade</div>
              <div>Solicitante</div>
              <div>Título</div>
              <div>Técnico</div>
              <div className="management-list__actions-label">Ações</div>
            </div>

            {carregando && (
              <div className="management-list__feedback">Carregando...</div>
            )}

            {!carregando &&
              chamadosFiltrados.map((c) => (
                <ChamadoRow
                  key={c.id}
                  chamado={c}
                  selecionado={selecionados.includes(c.id)}
                  isTi={isTi}
                  isAdmin={isAdmin}
                  menuAberto={menuAbertoId === c.id}
                  onAlternarSelecao={alternarSelecao}
                  onToggleMenu={alternarMenu}
                  onFecharMenu={fecharMenu}
                  onAbrirConversa={setChamadoConversa}
                  onAssumir={assumirChamado}
                  onEditar={editarChamado}
                  onConcluir={concluirChamado}
                  onRemover={remover}
                  menuRef={menuRef}
                  buttonRef={(node) => {
                    if (node) menuButtonRefs.current[c.id] = node;
                  }}
                  primeiroItemRef={(node) => {
                    if (node) menuItemRefs.current[c.id] = node;
                  }}
                />
              ))}

            {!carregando && chamadosFiltrados.length === 0 && (
              <div className="management-list__feedback">
                <EmptyState
                  title="Nenhum chamado encontrado"
                  description="Refine sua busca ou altere o status selecionado para encontrar registros."
                />
              </div>
            )}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => irParaPagina(pagina - 1)}
                disabled={pagina <= 1 || carregando}
              >
                Anterior
              </Button>

              <span>
                Página {pagina} de {meta.totalPages}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => irParaPagina(pagina + 1)}
                disabled={pagina >= meta.totalPages || carregando}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </div>

      <ChamadoEditModal
        open={Boolean(editandoId)}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={fecharEdicao}
        podeDefinirPrioridade={podeDefinirPrioridade}
        tecnicos={tecnicos}
        erro={erro}
      />

      <ChamadoConversationModal
        chamado={chamadoConversa}
        open={Boolean(chamadoConversa)}
        onClose={() => setChamadoConversa(null)}
        allowInternal={isTi || isAdmin}
        onUpdated={() => chamadosQuery.refetch()}
      />
    </div>
  );
}
