"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { buscarAtivo } from "@/services/api/ativosApi";
import AtivoDetalhesView from "./AtivoDetalhesView";

function PatrimonioLoading() {
  return (
    <div className="mx-auto max-w-[920px] px-4 pb-20 pt-4 text-od-text" aria-busy="true">
      <div className="mb-6 flex gap-2">
        <div className="h-10 w-24 animate-pulse rounded-xl bg-od-border/30 dark:bg-od-surface-muted" />
        <div className="h-10 w-20 animate-pulse rounded-xl bg-od-border/30 dark:bg-od-surface-muted" />
      </div>
      <div className="mb-6 h-40 animate-pulse rounded-2xl bg-od-border/30 dark:bg-od-surface-muted" />
      <div className="space-y-4">
        {["a", "b", "c"].map((k) => (
          <div
            key={k}
            className="h-28 animate-pulse rounded-2xl bg-od-border/30 dark:bg-od-surface-muted"
          />
        ))}
      </div>
    </div>
  );
}

export default function AtivoDetalhesCliente() {
  const { id } = useParams();
  const [ativo, setAtivo] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancel = false;
    setErro(null);
    async function load() {
      try {
        const data = await buscarAtivo(id);
        if (!cancel) setAtivo(data);
      } catch (e) {
        if (!cancel) setErro(e?.message || "Erro ao carregar ativo");
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, [id]);

  if (erro) {
    return (
      <div className="mx-auto max-w-[920px] px-4 pb-20 pt-4 text-od-text">
        <div className="rounded-2xl border border-od-border/90 bg-od-card p-6 shadow-sm dark:border-od-border dark:bg-od-bg">
          <h1 className="text-xl font-semibold tracking-tight text-od-text [font-family:var(--font-display)]">
            Ativo não encontrado
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-od-muted">{erro}</p>
          <Link
            href="/ativos"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-xl border border-od-border bg-od-card px-4 text-sm font-medium text-od-text-soft shadow-sm transition-colors hover:bg-od-surface-soft dark:border-od-border-strong dark:bg-od-surface dark:text-od-text dark:hover:bg-od-surface-muted"
          >
            Voltar à lista
          </Link>
        </div>
      </div>
    );
  }

  if (!ativo) {
    return <PatrimonioLoading />;
  }

  return <AtivoDetalhesView ativo={ativo} />;
}
