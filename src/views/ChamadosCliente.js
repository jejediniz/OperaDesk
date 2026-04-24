import { useAuth } from "../contextos/authContext";
import { useChamados } from "../contextos/chamadosContext";
import { useMemo, useState } from "react";
import { Button, EmptyState, Input, PageHeader } from "../components/ui";
import ChamadoConversationModal from "../components/chamados/ChamadoConversationModal";
import {
  PRIORIDADE_LABEL,
  STATUS_FILTERS,
  STATUS_LABEL,
} from "../config/chamados";
import { formatDate } from "../utils/formatters";

export default function ChamadosCliente() {
  const { usuario } = useAuth();
  const { chamados, carregando, erro, recarregar } = useChamados();
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [chamadoAtivo, setChamadoAtivo] = useState(null);

  const isAdmin = usuario?.admin === true;
  const isTi = usuario?.tipo === "ti";
  const usuarioId = usuario?.id;

  const chamadosPorPerfil = useMemo(() => {
    if (!usuarioId) return [];

    if (isAdmin) {
      return chamados;
    }

    if (isTi) {
      return chamados.filter(
        (c) => (c.tecnico?.id ?? c.tecnico_id) === usuarioId
      );
    }

    return chamados.filter(
      (c) => (c.usuario_id ?? c.solicitante?.id) === usuarioId
    );
  }, [chamados, usuarioId, isAdmin, isTi]);

  const filteredChamados = useMemo(() => {
    const termos = filtroTexto.trim().toLowerCase();
    return chamadosPorPerfil.filter((c) => {
      const matchesStatus =
        statusFiltro === "todos" ||
        (statusFiltro === "concluido"
          ? ["concluido", "fechado"].includes(c.status)
          : c.status === statusFiltro);

      const matchesTexto =
        !termos ||
        [c.titulo, c.descricao, c.solicitante?.nome, c.id]
          .filter(Boolean)
          .some((valor) => valor.toString().toLowerCase().includes(termos));

      return matchesStatus && matchesTexto;
    });
  }, [chamadosPorPerfil, filtroTexto, statusFiltro]);

  if (carregando) {
    return <p>Carregando chamados...</p>;
  }

  if (erro) {
    return <p className="alert alert-error">{erro}</p>;
  }

  return (
    <>
      <PageHeader
        centered
        title="Meus chamados"
        subtitle="Acompanhe o andamento dos seus atendimentos"
      />

      <section className="meus-chamados">
        <div className="meus-chamados-header">
          <div className="filtro-status">
            {STATUS_FILTERS.map((filtro) => (
              <button
                key={filtro.value}
                type="button"
                className={`filtro-btn ${
                  statusFiltro === filtro.value ? "ativo" : ""
                }`}
                onClick={() => setStatusFiltro(filtro.value)}
              >
                {filtro.label}
              </button>
            ))}
          </div>

          <div className="filtro-busca">
            <Input
              label="Buscar chamados"
              hideLabel
              placeholder="Buscar por título ou descrição"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              className="filtro-btn limpar"
              onClick={() => setFiltroTexto("")}
              disabled={!filtroTexto}
            >
              Limpar
            </Button>
          </div>
        </div>

        {filteredChamados.length === 0 && (
          <EmptyState
            title="Nenhum chamado encontrado"
            description="Ajuste a busca ou o status selecionado para encontrar seus atendimentos."
          />
        )}

        <div className="cliente-list">
          {filteredChamados.map((c) => (
            <article key={c.id} className="cliente-card">
              <div className="cliente-topo">
                <span className={`status status-${c.status}`}>
                  {STATUS_LABEL[c.status] || c.status}
                </span>
                <span className="data">
                  Atualizado em {formatDate(c.updated_at || c.created_at)}
                </span>
              </div>

              <h4 className="demanda">{c.titulo}</h4>

              <div className="cliente-resumo">
                <div className="cliente-resumo__item">
                  <small>Técnico</small>
                  <strong>{c.tecnico?.nome || "Sem responsável"}</strong>
                </div>
                <div className="cliente-resumo__item">
                  <small>Prioridade</small>
                  <div className={`prioridade-badge prioridade-${c.prioridade}`}>
                    {PRIORIDADE_LABEL[c.prioridade] || "—"}
                  </div>
                </div>
                <div className="cliente-resumo__item">
                  <small>Solicitante</small>
                  <strong>{c.solicitante?.nome || "—"}</strong>
                </div>
              </div>

              {c.descricao && (
                <p className="obs">{c.descricao}</p>
              )}

              <div className="cliente-meta">
                {c.setor && (
                  <span>
                    <small>Setor</small>
                    <strong>{c.setor}</strong>
                  </span>
                )}
                {c.solicitante?.tipo && (
                  <span>
                    <small>Perfil</small>
                    <strong>{c.solicitante.tipo}</strong>
                  </span>
                )}
                <span>
                  <small>Criado em</small>
                  <strong>{formatDate(c.created_at)}</strong>
                </span>
                <span>
                  <small>ID</small>
                  <strong>{c.id}</strong>
                </span>
              </div>

              <div className="cliente-card__actions">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setChamadoAtivo(c)}
                >
                  Abrir conversa
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ChamadoConversationModal
        chamado={chamadoAtivo}
        open={Boolean(chamadoAtivo)}
        onClose={() => setChamadoAtivo(null)}
        onUpdated={recarregar}
      />
    </>
  );
}
