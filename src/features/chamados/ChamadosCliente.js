"use client";

import { useAuth } from "@/contexts/authContext";
import { useChamadosQuery } from "@/features/chamados/useChamadosQueries";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, EmptyState, Input, PageHeader, SkeletonCard } from "@/components/ui";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import ChamadoConversationModal from "@/features/chamados/ChamadoConversationModal";
import {
  PRIORIDADE_LABEL,
  STATUS_FECHADOS,
  STATUS_FILTERS,
  STATUS_LABEL
} from "@/constants/chamados";
import { formatDate, formatDateTime, formatRelative } from "@/utils/formatters";

export default function ChamadosCliente() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [statusFiltro, setStatusFiltro] = usePersistentState(
    "operadesk:meus-chamados:statusFiltro",
    "todos"
  );
  const [filtroTexto, setFiltroTexto] = useState("");
  const [chamadoAtivo, setChamadoAtivo] = useState(null);

  const isAdmin = usuario?.admin === true;
  const isTi = usuario?.tipo === "ti";

  const filtroTextoDebounced = useDebouncedValue(filtroTexto.trim(), 300);

  // TI (não-admin) vê só o que é dele; admin vê tudo; comum é filtrado pelo
  // próprio backend automaticamente pelo cookie de sessão.
  const tecnicoId = isTi && !isAdmin ? "me" : undefined;

  const chamadosQuery = useChamadosQuery({
    page: 1,
    limit: 100,
    q: filtroTextoDebounced || undefined,
    tecnicoId
  });

  const chamados = useMemo(() => chamadosQuery.data?.items ?? [], [chamadosQuery.data]);
  const carregando = chamadosQuery.isLoading;
  const erro = chamadosQuery.error?.message;

  const filteredChamados = useMemo(() => {
    return chamados.filter((c) => {
      if (statusFiltro === "todos") return true;
      if (statusFiltro === "concluido") {
        return STATUS_FECHADOS.includes(c.status);
      }
      return c.status === statusFiltro;
    });
  }, [chamados, statusFiltro]);

  const buscaAtiva = filtroTexto.trim() !== "" || statusFiltro !== "todos";

  if (carregando) {
    return (
      <>
        <PageHeader
          centered
          title="Meus chamados"
          subtitle="Acompanhe o andamento dos seus atendimentos"
        />
        <section className="meus-chamados">
          <div className="cliente-list" aria-busy="true" aria-live="polite">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonCard key={idx} lines={3} />
            ))}
          </div>
        </section>
      </>
    );
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
                className={`filtro-btn ${statusFiltro === filtro.value ? "ativo" : ""}`}
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
              placeholder="Buscar por título, descrição, técnico ou setor"
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

        {filteredChamados.length === 0 &&
          (buscaAtiva ? (
            <EmptyState
              title="Nenhum chamado encontrado"
              description="Ajuste a busca ou o status selecionado para encontrar seus atendimentos."
              actionLabel="Limpar filtros"
              onAction={() => {
                setFiltroTexto("");
                setStatusFiltro("todos");
              }}
            />
          ) : (
            <EmptyState
              title="Você ainda não tem chamados"
              description="Quando precisar de suporte, abra um chamado e a equipe será notificada."
              actionLabel="Abrir meu primeiro chamado"
              onAction={() => router.push("/abrir-chamado")}
            />
          ))}

        <div className="cliente-list">
          {filteredChamados.map((c) => (
            <article key={c.id} className="cliente-card">
              <div className="cliente-topo">
                <span className={`status status-${c.status}`}>
                  {STATUS_LABEL[c.status] || c.status}
                </span>
                <span className="data" title={formatDateTime(c.updated_at || c.created_at)}>
                  Atualizado {formatRelative(c.updated_at || c.created_at)}
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

              {c.descricao && <p className="obs">{c.descricao}</p>}

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
                <Button variant="secondary" size="sm" onClick={() => setChamadoAtivo(c)}>
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
        onUpdated={() => chamadosQuery.refetch()}
      />
    </>
  );
}
