"use client";

import { Button } from "@/components/ui";
import { PRIORIDADE_LABEL, STATUS_LABEL } from "@/constants/chamados";
import { formatDate, formatDateTime, formatRelative } from "@/utils/formatters";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const MAX_VISIBLE = 8;

function getTecnicoNome(chamado) {
  return chamado.tecnico?.nome || chamado.tecnico_responsavel?.nome || "Não atribuído";
}

export default function DashboardModal({
  open,
  title,
  chamados,
  resumoPrioridade,
  showSeeAll,
  onSeeAll,
  onClose,
  seeAllLabel
}) {
  const { containerRef, initialFocusRef } = useFocusTrap({ active: open, onClose });

  if (!open) return null;

  return (
    <div
      className="dashboard-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="dashboard-modal"
        ref={containerRef}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="dashboard-modal__header">
          <div>
            <h3>{title}</h3>
            <p className="dashboard-modal__subtitle">
              {chamados.length} chamado{chamados.length === 1 ? "" : "s"}
            </p>
          </div>
          <Button ref={initialFocusRef} variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </header>

        <div className="dashboard-modal__summary">
          <div>
            <span>Prioridade baixa</span>
            <strong>{resumoPrioridade.baixa}</strong>
          </div>
          <div>
            <span>Prioridade média</span>
            <strong>{resumoPrioridade.media}</strong>
          </div>
          <div>
            <span>Prioridade alta</span>
            <strong>{resumoPrioridade.alta}</strong>
          </div>
        </div>

        {chamados.length === 0 ? (
          <p className="dashboard-modal__empty">Nenhum chamado encontrado para este filtro.</p>
        ) : (
          <ul className="dashboard-modal__list">
            {chamados.slice(0, MAX_VISIBLE).map((chamado) => (
              <li key={chamado.id}>
                <div className="dashboard-modal__item">
                  <div className="dashboard-modal__main">
                    <div className="dashboard-modal__item-top">
                      <span className={`status-badge ${chamado.status || "aberto"}`}>
                        {STATUS_LABEL[chamado.status] || chamado.status}
                      </span>
                      <span
                        className={`prioridade-badge prioridade-${chamado.prioridade || "media"}`}
                      >
                        {PRIORIDADE_LABEL[chamado.prioridade] || "Média"}
                      </span>
                    </div>
                    <strong>{chamado.titulo}</strong>
                    <div className="dashboard-modal__meta">
                      <span>Solicitante: {chamado.solicitante?.nome || "Não informado"}</span>
                      <span>Técnico: {getTecnicoNome(chamado)}</span>
                    </div>
                    <div className="dashboard-modal__meta dashboard-modal__meta--secondary">
                      <span>Setor: {chamado.setor || "Não informado"}</span>
                      <span>Criado em {formatDate(chamado.created_at)}</span>
                    </div>
                  </div>
                  <div className="dashboard-modal__side">
                    <span className="dashboard-modal__eyebrow">Chamado #{chamado.id}</span>
                    <span
                      className="dashboard-modal__date"
                      title={formatDateTime(chamado.updated_at || chamado.created_at)}
                    >
                      Atualizado {formatRelative(chamado.updated_at || chamado.created_at)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {showSeeAll && (
          <div className="dashboard-modal__footer">
            <Button variant="secondary" onClick={onSeeAll}>
              {seeAllLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
