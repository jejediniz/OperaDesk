"use client";

import dynamic from "next/dynamic";
import { Button, EmptyState, PageHeader, SkeletonRow } from "@/components/ui";
import ChamadosToolbar from "./ChamadosToolbar";
import ChamadosSelectionBar from "./ChamadosSelectionBar";
import ChamadoRow from "./ChamadoRow";
import { useChamadosGestao } from "./useChamadosGestao";

const ChamadoEditModal = dynamic(() => import("./ChamadoEditModal"), {
  ssr: false
});

const ChamadoConversationModal = dynamic(() => import("./ChamadoConversationModal"), {
  ssr: false
});

export default function Chamados() {
  const {
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
  } = useChamadosGestao();

  return (
    <div>
      <PageHeader
        title="Gestão de Chamados"
        subtitle="Visualize e opere a fila de chamados com foco total na gestão."
      />

      <div>
        <div className="table-card table-card--chamados">
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
            onLimiteChange={setLimite}
            totalFiltrado={chamadosFiltrados.length}
            totalPagina={chamados.length}
            filtrosAtivos={filtrosAtivos}
            onLimparFiltros={limparFiltrosESelecao}
          />

          <ChamadosSelectionBar
            selecionadosCount={selecionados.length}
            quantidadeConcluiveis={quantidadeConcluiveis}
            isTi={isTi}
            onAssumirSelecionados={() =>
              acoes.assumirSelecionados(chamadosFiltrados, selecionados, () => setSelecionados([]))
            }
            onConcluirSelecionados={() =>
              acoes.concluirSelecionados(chamadosFiltrados, selecionados, () => setSelecionados([]))
            }
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
              <div className="skeleton-stack" aria-busy="true" aria-live="polite">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonRow key={idx} />
                ))}
              </div>
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
                  onAssumir={acoes.assumirChamado}
                  onEditar={editarChamado}
                  onConcluir={acoes.concluirChamado}
                  onRemover={acoes.remover}
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
                {filtrosAtivos > 0 ? (
                  <EmptyState
                    title="Nenhum chamado encontrado"
                    description="Sua busca ou filtro de status não retornou resultados."
                    actionLabel="Limpar filtros"
                    onAction={limparFiltrosESelecao}
                  />
                ) : (
                  <EmptyState
                    title="Nenhum chamado na fila"
                    description="A fila está limpa no momento. Aproveite para revisar pendências antigas."
                  />
                )}
              </div>
            )}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => irParaPagina(pagina - 1, meta.totalPages)}
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
                onClick={() => irParaPagina(pagina + 1, meta.totalPages)}
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
