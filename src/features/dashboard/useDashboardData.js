"use client";

import { useMemo } from "react";
import { useChamadosMetricsQuery, useChamadosQuery } from "@/features/chamados/useChamadosQueries";
import { useAuth } from "@/contexts/authContext";
import { isStatusFechado } from "@/constants/chamados";

const RECENT_LIMIT = 8;

function isComumProfile(usuario) {
  if (!usuario) return false;
  return usuario.admin !== true && usuario.tipo !== "ti";
}

export function useDashboardData() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.admin === true;
  const isTi = usuario?.tipo === "ti";
  const isComum = isComumProfile(usuario);

  const metricsQuery = useChamadosMetricsQuery({ enabled: Boolean(usuario) });
  const recentesQuery = useChamadosQuery({ limit: RECENT_LIMIT });

  const metrics = useMemo(() => {
    const data = metricsQuery.data || {};
    return {
      total: data.total ?? 0,
      abertos: data.abertos ?? 0,
      em_andamento: data.em_andamento ?? 0,
      concluidos: data.concluidos ?? 0,
      altaPrioridadePendentes: data.alta_prioridade_pendentes ?? 0,
      semTecnico: data.sem_tecnico ?? 0
    };
  }, [metricsQuery.data]);

  const recentes = useMemo(() => {
    const raw = recentesQuery.data?.items;
    const items = Array.isArray(raw) ? raw : [];
    return [...items]
      .sort(
        (a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
      )
      .slice(0, RECENT_LIMIT);
  }, [recentesQuery.data]);

  const overview = useMemo(() => {
    const total = metrics.total;
    const statusItems = [
      { key: "aberto", label: "Abertos", value: metrics.abertos, variant: "warning" },
      {
        key: "em_andamento",
        label: "Em andamento",
        value: metrics.em_andamento,
        variant: "primary"
      },
      { key: "concluido", label: "Concluídos", value: metrics.concluidos, variant: "success" }
    ].map((item) => ({
      ...item,
      percent: total > 0 ? Math.round((item.value / total) * 100) : 0
    }));

    return {
      statusItems,
      taxaConclusao: total > 0 ? Math.round((metrics.concluidos / total) * 100) : 0
    };
  }, [metrics]);

  const filtrarRecentesPorCard = (key) => {
    const raw = recentesQuery.data?.items;
    const items = Array.isArray(raw) ? raw : [];
    if (key === "abertos") return items.filter((c) => c.status === "aberto");
    if (key === "andamento") return items.filter((c) => c.status === "em_andamento");
    if (key === "concluidos") return items.filter((c) => isStatusFechado(c.status));
    return items;
  };

  return {
    isAdmin,
    isTi,
    isComum,
    usuario,
    metrics,
    overview,
    recentes,
    isLoading: metricsQuery.isLoading || recentesQuery.isLoading,
    isError: metricsQuery.isError || recentesQuery.isError,
    filtrarRecentesPorCard
  };
}
