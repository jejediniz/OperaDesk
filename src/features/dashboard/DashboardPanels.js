"use client";

import { Card } from "@/components/ui";
import { STATUS_LABEL } from "@/constants/chamados";
import { formatDateTime, formatRelative } from "@/utils/formatters";

export default function DashboardPanels({ overview, recentes, total, config }) {
  return (
    <section className="dashboard-panels">
      <Card className="dashboard-panel dashboard-panel--wide">
        <div className="dashboard-panel__header">
          <div>
            <span className="dashboard-panel__eyebrow">{config.distributionEyebrow}</span>
            <h3>{config.distributionTitle}</h3>
          </div>
          <span className="dashboard-panel__caption">
            Baseado em {total} chamado{total === 1 ? "" : "s"}
          </span>
        </div>

        <div className="dashboard-bars">
          {overview.statusItems.map((item) => (
            <div key={item.key} className="dashboard-bar">
              <div className="dashboard-bar__top">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="dashboard-bar__track" aria-hidden="true">
                <span
                  className={`dashboard-bar__fill dashboard-bar__fill--${item.variant}`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <span className="dashboard-bar__caption">{item.percent}% da operação</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="dashboard-panel">
        <div className="dashboard-panel__header">
          <div>
            <span className="dashboard-panel__eyebrow">{config.highlightsEyebrow}</span>
            <h3>{config.highlightsTitle}</h3>
          </div>
        </div>

        <div className="dashboard-highlights">
          {config.highlights.map((item) => (
            <div key={item.label} className="dashboard-highlight">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </Card>

      <Card className="dashboard-panel">
        <div className="dashboard-panel__header">
          <div>
            <span className="dashboard-panel__eyebrow">{config.activityEyebrow}</span>
            <h3>{config.activityTitle}</h3>
          </div>
        </div>

        {recentes.length === 0 ? (
          <p className="dashboard-panel__empty">{config.emptyActivity}</p>
        ) : (
          <ul className="dashboard-activity">
            {recentes.map((chamado) => (
              <li key={chamado.id} className="dashboard-activity__item">
                <div>
                  <strong>{chamado.titulo}</strong>
                  <span>{chamado.solicitante?.nome || "Solicitante não informado"}</span>
                </div>
                <div className="dashboard-activity__side">
                  <span className={`status-badge ${chamado.status || "aberto"}`}>
                    {STATUS_LABEL[chamado.status] || chamado.status}
                  </span>
                  <span title={formatDateTime(chamado.updated_at || chamado.created_at)}>
                    {formatRelative(chamado.updated_at || chamado.created_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
