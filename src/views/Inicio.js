import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChamados } from "../contextos/chamadosContext";
import { useAuth } from "../contextos/authContext";
import { Button, Card } from "../components/ui";
import { PRIORIDADE_LABEL, STATUS_LABEL } from "../config/chamados";
import { formatDate } from "../utils/formatters";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";

export default function Inicio() {
  const { usuario } = useAuth();
  const { chamados } = useChamados();
  const router = useRouter();
  const [modalKey, setModalKey] = useState(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const lastFocusedElementRef = useRef(null);
  const isAdmin = usuario?.admin === true;
  const isTi = usuario?.tipo === "ti";
  const isComum = !isAdmin && !isTi;
  const usuarioId = usuario?.id;

  const chamadosVisiveis = useMemo(() => {
    if (!usuarioId) return [];

    if (isAdmin) {
      return chamados;
    }

    if (isTi) {
      return chamados.filter(
        (c) =>
          (c.tecnico?.id ?? c.tecnico_id ?? c.tecnico_responsavel?.id) === usuarioId
      );
    }

    return chamados.filter(
      (c) => (c.usuario_id ?? c.solicitante?.id) === usuarioId
    );
  }, [chamados, isAdmin, isTi, usuarioId]);

  /* ======================
     MÉTRICAS REAIS
  ====================== */
  const total = chamadosVisiveis.length;

  const abertos = chamadosVisiveis.filter((c) => c.status === "aberto").length;
  const andamento = chamadosVisiveis.filter(
    (c) => c.status === "em_andamento"
  ).length;
  const concluidos = chamadosVisiveis.filter((c) =>
    ["concluido", "fechado"].includes(c.status)
  ).length;

  /* ======================
     NÚMEROS ANIMADOS
  ====================== */
  const totalAnimado = useAnimatedNumber(total);
  const abertosAnimado = useAnimatedNumber(abertos);
  const andamentoAnimado = useAnimatedNumber(andamento);
  const concluidosAnimado = useAnimatedNumber(concluidos);

  const metricCards = useMemo(
    () => [
      {
        key: "total",
        label: isComum ? "Meus chamados" : "Total de chamados",
        value: totalAnimado,
        sublabel: isComum
          ? "Todos os atendimentos vinculados ao seu perfil"
          : "Chamados registrados no seu painel atual",
        variant: "primary",
        icon: "📊",
        cta: isComum ? "Ver visão geral da sua fila" : "Ver panorama completo",
      },
      {
        key: "abertos",
        label: "Abertos",
        value: abertosAnimado,
        sublabel: isComum
          ? "Chamados aguardando retorno ou início"
          : "Demandas aguardando atendimento",
        variant: "warning",
        icon: "📂",
        cta: isComum ? "Ver o que ainda está pendente" : "Ver fila pendente",
      },
      {
        key: "andamento",
        label: "Em andamento",
        value: andamentoAnimado,
        sublabel: isComum
          ? "Atendimentos em análise ou execução"
          : "Técnicos trabalhando ativo",
        variant: "primary",
        icon: "🛠️",
        cta: isComum ? "Ver atendimentos em progresso" : "Ver atendimentos ativos",
      },
      {
        key: "concluidos",
        label: "Concluídos",
        value: concluidosAnimado,
        sublabel: isComum
          ? "Chamados finalizados para consulta"
          : "Atendimentos concluídos",
        variant: "success",
        icon: "✅",
        cta: "Ver histórico recente",
      },
    ],
    [totalAnimado, abertosAnimado, andamentoAnimado, concluidosAnimado, isComum]
  );

  const filtrarPorCard = useCallback(
    (key) => {
      if (key === "abertos") {
        return chamadosVisiveis.filter((c) => c.status === "aberto");
      }
      if (key === "andamento") {
        return chamadosVisiveis.filter((c) => c.status === "em_andamento");
      }
      if (key === "concluidos") {
        return chamadosVisiveis.filter((c) =>
          ["concluido", "fechado"].includes(c.status)
        );
      }
      return chamadosVisiveis;
    },
    [chamadosVisiveis]
  );

  const detalhesChamados = useMemo(() => {
    if (!modalKey) return [];
    return filtrarPorCard(modalKey);
  }, [modalKey, filtrarPorCard]);

  const resumoPrioridade = useMemo(() => {
    return detalhesChamados.reduce(
      (acc, chamado) => {
        const prioridade = chamado.prioridade || "media";
        acc[prioridade] = (acc[prioridade] || 0) + 1;
        return acc;
      },
      { baixa: 0, media: 0, alta: 0 }
    );
  }, [detalhesChamados]);

  const dashboardOverview = useMemo(() => {
    const semTecnico = chamadosVisiveis.filter(
      (c) => !(c.tecnico?.nome || c.tecnico_responsavel?.nome)
    ).length;
    const altaPrioridadePendentes = chamadosVisiveis.filter(
      (c) =>
        c.prioridade === "alta" &&
        !["concluido", "fechado"].includes(c.status)
    ).length;
    const ultimaAtualizacao = [...chamadosVisiveis]
      .sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at) -
          new Date(a.updated_at || a.created_at)
      )
      .slice(0, 4);

    const statusItems = [
      {
        key: "aberto",
        label: "Abertos",
        value: abertos,
        variant: "warning",
      },
      {
        key: "em_andamento",
        label: "Em andamento",
        value: andamento,
        variant: "primary",
      },
      {
        key: "concluido",
        label: "Concluídos",
        value: concluidos,
        variant: "success",
      },
    ].map((item) => ({
      ...item,
      percent: total > 0 ? Math.round((item.value / total) * 100) : 0,
    }));

    return {
      statusItems,
      semTecnico,
      altaPrioridadePendentes,
      taxaConclusao: total > 0 ? Math.round((concluidos / total) * 100) : 0,
      ultimaAtualizacao,
    };
  }, [abertos, andamento, chamadosVisiveis, concluidos, total]);

  const dashboardConfig = useMemo(() => {
    if (isComum) {
      return {
        title: "Dashboard",
        distributionTitle: "Como está o andamento dos seus chamados",
        distributionEyebrow: "Acompanhamento",
        highlightsTitle: "O que observar agora",
        highlightsEyebrow: "Leitura rápida",
        activityTitle: "Atualizações recentes",
        activityEyebrow: "Movimento",
        emptyActivity: "Seus chamados vão aparecer aqui conforme forem atualizados.",
        highlights: [
          {
            label: "Alta prioridade ativa",
            value: dashboardOverview.altaPrioridadePendentes,
          },
          {
            label: "Sem responsável",
            value: dashboardOverview.semTecnico,
          },
          {
            label: "Chamados concluídos",
            value: `${dashboardOverview.taxaConclusao}%`,
          },
        ],
        detailRoute: "/meus-chamados",
        detailRouteLabel: "Ver todos os meus chamados",
      };
    }

      return {
        title: "Dashboard",
        distributionTitle: isTi
          ? "Distribuição da sua carteira atual"
          : "Distribuição atual da fila",
      distributionEyebrow: "Visão operacional",
      highlightsTitle: isTi ? "Pontos de atenção da sua fila" : "Pontos de atenção",
      highlightsEyebrow: "Leitura rápida",
      activityTitle: "Movimento recente",
      activityEyebrow: "Atualizações",
      emptyActivity: "Ainda não há chamados recentes para exibir.",
      highlights: [
        {
          label: "Alta prioridade pendente",
          value: dashboardOverview.altaPrioridadePendentes,
        },
        {
          label: "Chamados sem técnico",
          value: dashboardOverview.semTecnico,
        },
        {
          label: "Taxa de conclusão",
          value: `${dashboardOverview.taxaConclusao}%`,
        },
      ],
      detailRoute: "/chamados",
      detailRouteLabel: "Ver todos na gestão",
    };
  }, [dashboardOverview, isComum, isTi]);

  const getTecnicoNome = useCallback(
    (chamado) =>
      chamado.tecnico?.nome ||
      chamado.tecnico_responsavel?.nome ||
      "Não atribuído",
    []
  );

  const fecharModal = useCallback(() => {
    setModalKey(null);
  }, []);

  useEffect(() => {
    if (!modalKey) return;

    lastFocusedElementRef.current = document.activeElement;
    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        fecharModal();
        return;
      }

      if (event.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) return;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      lastFocusedElementRef.current?.focus?.();
    };
  }, [modalKey, fecharModal]);

  const modalTitle =
    metricCards.find((card) => card.key === modalKey)?.label || "";

  return (
    <div>
      <div className="page-header page-header--centered">
        <h2>{dashboardConfig.title}</h2>
      </div>

      <section className="dashboard-grid">
        {metricCards.map((card) => (
          <Card
            key={card.key}
            className={`metric-card metric-card--${card.variant} metric-card--clickable`}
            role="button"
            tabIndex={0}
            onClick={() => setModalKey(card.key)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setModalKey(card.key);
              }
            }}
          >
            <span className="metric-card__accent" aria-hidden="true" />
            <div className="metric-card__header">
              <span className="metric-card__icon">{card.icon}</span>
              <div className="metric-card__heading">
                <span className="metric-card__label">{card.label}</span>
                <span className="metric-card__hint">{card.cta}</span>
              </div>
            </div>
            <strong className="metric-card__value">{card.value}</strong>
            <p className="metric-card__body">{card.sublabel}</p>
            <div className="metric-card__footer">
              <span>Detalhar indicadores</span>
              <span aria-hidden="true">→</span>
            </div>
          </Card>
        ))}
      </section>

      <section className="dashboard-panels">
        <Card className="dashboard-panel dashboard-panel--wide">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__eyebrow">
                {dashboardConfig.distributionEyebrow}
              </span>
              <h3>{dashboardConfig.distributionTitle}</h3>
            </div>
            <span className="dashboard-panel__caption">
              Baseado em {total} chamado{total === 1 ? "" : "s"}
            </span>
          </div>

          <div className="dashboard-bars">
            {dashboardOverview.statusItems.map((item) => (
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
              <span className="dashboard-panel__eyebrow">
                {dashboardConfig.highlightsEyebrow}
              </span>
              <h3>{dashboardConfig.highlightsTitle}</h3>
            </div>
          </div>

          <div className="dashboard-highlights">
            {dashboardConfig.highlights.map((item) => (
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
              <span className="dashboard-panel__eyebrow">
                {dashboardConfig.activityEyebrow}
              </span>
              <h3>{dashboardConfig.activityTitle}</h3>
            </div>
          </div>

          {dashboardOverview.ultimaAtualizacao.length === 0 ? (
            <p className="dashboard-panel__empty">
              {dashboardConfig.emptyActivity}
            </p>
          ) : (
            <ul className="dashboard-activity">
              {dashboardOverview.ultimaAtualizacao.map((chamado) => (
                <li key={chamado.id} className="dashboard-activity__item">
                  <div>
                    <strong>{chamado.titulo}</strong>
                    <span>
                      {chamado.solicitante?.nome || "Solicitante não informado"}
                    </span>
                  </div>
                  <div className="dashboard-activity__side">
                    <span className={`status-badge ${chamado.status || "aberto"}`}>
                      {STATUS_LABEL[chamado.status] || chamado.status}
                    </span>
                    <span>{formatDate(chamado.updated_at || chamado.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {modalKey && (
        <div
          className="dashboard-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
          onClick={fecharModal}
        >
          <div
            className="dashboard-modal"
            ref={modalRef}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="dashboard-modal__header">
              <div>
                <h3>{modalTitle}</h3>
                <p className="dashboard-modal__subtitle">
                  {detalhesChamados.length} chamado
                  {detalhesChamados.length === 1 ? "" : "s"}
                </p>
              </div>
              <Button ref={closeButtonRef} variant="ghost" onClick={fecharModal}>
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

            {detalhesChamados.length === 0 ? (
              <p className="dashboard-modal__empty">
                Nenhum chamado encontrado para este filtro.
              </p>
            ) : (
              <ul className="dashboard-modal__list">
                {detalhesChamados.slice(0, 8).map((chamado) => (
                  <li key={chamado.id}>
                    <div className="dashboard-modal__item">
                      <div className="dashboard-modal__main">
                        <div className="dashboard-modal__item-top">
                          <span className={`status-badge ${chamado.status || "aberto"}`}>
                            {STATUS_LABEL[chamado.status] || chamado.status}
                          </span>
                          <span className={`prioridade-badge prioridade-${chamado.prioridade || "media"}`}>
                            {PRIORIDADE_LABEL[chamado.prioridade] || "Média"}
                          </span>
                        </div>
                        <strong>{chamado.titulo}</strong>
                        <div className="dashboard-modal__meta">
                          <span>Solicitante: {chamado.solicitante?.nome || "Não informado"}</span>
                          <span>
                            Técnico: {getTecnicoNome(chamado)}
                          </span>
                        </div>
                        <div className="dashboard-modal__meta dashboard-modal__meta--secondary">
                          <span>Setor: {chamado.setor || "Não informado"}</span>
                          <span>Criado em {formatDate(chamado.created_at)}</span>
                        </div>
                      </div>
                      <div className="dashboard-modal__side">
                        <span className="dashboard-modal__eyebrow">Chamado #{chamado.id}</span>
                        <span className="dashboard-modal__date">
                          Atualizado em {formatDate(chamado.updated_at || chamado.created_at)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {detalhesChamados.length > 8 && (
              <div className="dashboard-modal__footer">
                <Button
                  variant="secondary"
                  onClick={() => {
                    fecharModal();
                    router.push(dashboardConfig.detailRoute);
                  }}
                >
                  {dashboardConfig.detailRouteLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
