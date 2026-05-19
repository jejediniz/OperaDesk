"use client";

import { STATUS_ATIVO_LABEL } from "@/constants/ativos";

export default function StatusAtivoBadge({ status }) {
  const key = status || "disponivel";
  return <span className={`status-badge ${key}`}>{STATUS_ATIVO_LABEL[key] ?? key}</span>;
}
