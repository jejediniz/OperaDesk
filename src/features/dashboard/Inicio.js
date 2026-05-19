"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MetricsGrid from "./MetricsGrid";
import DashboardPanels from "./DashboardPanels";
import DashboardModal from "./DashboardModal";
import { useDashboardData } from "./useDashboardData";

function buildMetricCards({ metrics, isComum }) {
  return [
    {
      key: "total",
      label: isComum ? "Meus chamados" : "Total de chamados",
      value: metrics.total,
      sublabel: isComum
        ? "Todos os atendimentos vinculados ao seu perfil"
        : "Chamados registrados no seu painel atual",
      variant: "primary",
      icon: "📊",
      cta: isComum ? "Ver visão geral da sua fila" : "Ver panorama completo"
    },
    {
      key: "abertos",
      label: "Abertos",
      value: metrics.abertos,
      sublabel: isComum
        ? "Chamados aguardando retorno ou início"
        : "Demandas aguardando atendimento",
      variant: "warning",
      icon: "📂",
      cta: isComum ? "Ver o que ainda está pendente" : "Ver fila pendente"
    },
    {
      key: "andamento",
      label: "Em andamento",
      value: metrics.em_andamento,
      sublabel: isComum ? "Atendimentos em análise ou execução" : "Técnicos trabalhando ativo",
      variant: "primary",
      icon: "🛠️",
      cta: isComum ? "Ver atendimentos em progresso" : "Ver atendimentos ativos"
    },
    {
      key: "concluidos",
      label: "Concluídos",
      value: metrics.concluidos,
      sublabel: isComum ? "Chamados finalizados para consulta" : "Atendimentos concluídos",
      variant: "success",
      icon: "✅",
      cta: "Ver histórico recente"
    }
  ];
}

function buildDashboardConfig({ isComum, isTi, overview, metrics }) {
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
        { label: "Alta prioridade ativa", value: metrics.altaPrioridadePendentes },
        { label: "Sem responsável", value: metrics.semTecnico },
        { label: "Chamados concluídos", value: `${overview.taxaConclusao}%` }
      ],
      detailRoute: "/meus-chamados",
      detailRouteLabel: "Ver todos os meus chamados"
    };
  }

  return {
    title: "Dashboard",
    distributionTitle: isTi ? "Distribuição da sua carteira atual" : "Distribuição atual da fila",
    distributionEyebrow: "Visão operacional",
    highlightsTitle: isTi ? "Pontos de atenção da sua fila" : "Pontos de atenção",
    highlightsEyebrow: "Leitura rápida",
    activityTitle: "Movimento recente",
    activityEyebrow: "Atualizações",
    emptyActivity: "Ainda não há chamados recentes para exibir.",
    highlights: [
      { label: "Alta prioridade pendente", value: metrics.altaPrioridadePendentes },
      { label: "Chamados sem técnico", value: metrics.semTecnico },
      { label: "Taxa de conclusão", value: `${overview.taxaConclusao}%` }
    ],
    detailRoute: "/chamados",
    detailRouteLabel: "Ver todos na gestão"
  };
}

function buildSubtitulo({ metrics, isComum, isTi }) {
  const { total, abertos, em_andamento, altaPrioridadePendentes } = metrics;
  if (total === 0) {
    return isComum
      ? "Você ainda não tem chamados abertos. Quando precisar, é só registrar um novo."
      : "Nada na fila no momento — bom espaço para revisar processos.";
  }
  if (isComum) {
    const ativos = abertos + em_andamento;
    if (ativos === 0) return "Todos os seus chamados estão concluídos. Bom trabalho!";
    return `Você tem ${ativos} chamado${ativos === 1 ? "" : "s"} em acompanhamento.`;
  }
  if (isTi) {
    const meus = em_andamento + abertos;
    return meus > 0
      ? `Você tem ${meus} chamado${meus === 1 ? "" : "s"} para acompanhar hoje.`
      : "Sua fila está limpa — aproveite para revisar pendências antigas.";
  }
  return altaPrioridadePendentes > 0
    ? `${altaPrioridadePendentes} chamado${altaPrioridadePendentes === 1 ? "" : "s"} de alta prioridade aguardam atenção.`
    : "Operação tranquila — siga monitorando os indicadores abaixo.";
}

function calcularResumoPrioridade(chamados) {
  if (!Array.isArray(chamados)) {
    return { baixa: 0, media: 0, alta: 0 };
  }
  return chamados.reduce(
    (acc, chamado) => {
      const prioridade = chamado.prioridade || "media";
      acc[prioridade] = (acc[prioridade] || 0) + 1;
      return acc;
    },
    { baixa: 0, media: 0, alta: 0 }
  );
}

export default function Inicio() {
  const router = useRouter();
  const [modalKey, setModalKey] = useState(null);

  const { isTi, isComum, usuario, metrics, overview, recentes, filtrarRecentesPorCard } =
    useDashboardData();

  const metricCards = useMemo(() => buildMetricCards({ metrics, isComum }), [metrics, isComum]);

  const dashboardConfig = useMemo(
    () => buildDashboardConfig({ isComum, isTi, overview, metrics }),
    [isComum, isTi, overview, metrics]
  );

  const detalhesChamados = useMemo(
    () => (modalKey ? filtrarRecentesPorCard(modalKey) : []),
    [modalKey, filtrarRecentesPorCard]
  );

  const resumoPrioridade = useMemo(
    () => calcularResumoPrioridade(detalhesChamados),
    [detalhesChamados]
  );

  const fecharModal = useCallback(() => setModalKey(null), []);

  const modalTitle = metricCards.find((card) => card.key === modalKey)?.label || "";

  const primeiroNome = (usuario?.nome || "").trim().split(" ")[0] || "por aí";
  const saudacao = (() => {
    const hora = new Date().getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  })();

  const subtitulo = useMemo(
    () => buildSubtitulo({ metrics, isComum, isTi }),
    [metrics, isComum, isTi]
  );

  return (
    <div>
      <div className="page-header page-header--centered dashboard-greeting">
        <span className="dashboard-greeting__eyebrow">
          {saudacao}, {primeiroNome}
        </span>
        <h2>{dashboardConfig.title}</h2>
        <p className="dashboard-greeting__subtitle">{subtitulo}</p>
      </div>

      <MetricsGrid cards={metricCards} onSelect={setModalKey} />

      <DashboardPanels
        overview={overview}
        recentes={recentes}
        total={metrics.total}
        config={dashboardConfig}
      />

      <DashboardModal
        open={Boolean(modalKey)}
        title={modalTitle}
        chamados={detalhesChamados}
        resumoPrioridade={resumoPrioridade}
        showSeeAll={detalhesChamados.length >= 8 || metrics.total > recentes.length}
        seeAllLabel={dashboardConfig.detailRouteLabel}
        onSeeAll={() => {
          fecharModal();
          router.push(dashboardConfig.detailRoute);
        }}
        onClose={fecharModal}
      />
    </div>
  );
}
