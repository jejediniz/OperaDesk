"use client";

import { useCallback, useEffect, useState } from "react";
import { X, FileText, Pencil } from "lucide-react";
import { buscarAtivo } from "@/services/api/ativosApi";
import { formatDateTime } from "@/utils/formatters";
import StatusAtivoBadge from "./StatusAtivoBadge";
import AtivoForm from "./AtivoForm";

function DetalheLinha({ rotulo, valor }) {
  return (
    <div className="grid grid-cols-[minmax(0,7.5rem)_1fr] gap-x-4 gap-y-0.5 border-b border-od-border/40/90 py-3 text-sm last:border-0 dark:border-od-border/70">
      <dt className="shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-od-muted">
        {rotulo}
      </dt>
      <dd className="min-w-0 break-words font-medium leading-snug text-od-text">{valor ?? "—"}</dd>
    </div>
  );
}

export default function PatrimonioSlideOver({
  open,
  ativoId,
  initialTab = "detalhes",
  onClose,
  onSaved
}) {
  const [aba, setAba] = useState("detalhes");
  const [ativo, setAtivo] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    if (!ativoId) return;
    setCarregando(true);
    setErro(null);
    try {
      const d = await buscarAtivo(ativoId);
      setAtivo(d);
    } catch (e) {
      setErro(e?.message || "Não foi possível carregar o registro.");
      setAtivo(null);
    } finally {
      setCarregando(false);
    }
  }, [ativoId]);

  useEffect(() => {
    if (!open || !ativoId) return;
    carregar();
  }, [open, ativoId, carregar]);

  useEffect(() => {
    if (!open) return;
    setAba(initialTab === "editar" ? "editar" : "detalhes");
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return undefined;
    function onEsc(ev) {
      if (ev.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !ativoId) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-busy={carregando}
      aria-labelledby="patrimonio-slide-titulo"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 transition-opacity duration-200 dark:bg-black/60"
        aria-label="Fechar painel"
        onClick={onClose}
      />
      <div
        className="relative flex h-full w-full max-w-[26rem] flex-col overflow-hidden border-l border-od-border/90 bg-od-card shadow-2xl shadow-od-text/10 dark:border-od-border dark:bg-od-bg sm:max-w-md md:max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-od-border/40 bg-gradient-to-b from-od-surface-soft/95 to-od-card px-4 py-4 dark:border-od-border dark:from-od-surface/80 dark:to-od-bg">
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[11px] tabular-nums tracking-tight text-od-muted">
              {ativo?.numeroPatrimonio ?? "…"}
            </p>
            <h2
              id="patrimonio-slide-titulo"
              className="mt-0.5 truncate text-lg font-semibold tracking-tight text-od-text"
            >
              {carregando ? "Carregando…" : (ativo?.nome ?? "Patrimônio")}
            </h2>
          </div>
          <button
            type="button"
            className="rounded-xl border border-transparent p-2 text-od-muted transition-colors hover:border-od-border hover:bg-od-surface-muted hover:text-od-text dark:hover:border-od-border-strong dark:hover:bg-od-surface dark:hover:text-od-text"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="flex shrink-0 gap-1 border-b border-od-border/40 bg-od-surface-soft/60 px-3 py-1.5 dark:border-od-border dark:bg-od-surface/40">
          <button
            type="button"
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              aba === "detalhes"
                ? "bg-od-card text-od-text shadow-sm ring-1 ring-od-border/80 dark:bg-od-surface-muted dark:text-od-text dark:ring-od-border-strong"
                : "text-od-muted hover:bg-od-card/70 hover:text-od-text dark:text-od-muted dark:hover:bg-od-surface-muted/60 dark:hover:text-od-text"
            }`}
            onClick={() => setAba("detalhes")}
          >
            <FileText className="size-4 opacity-70" strokeWidth={1.75} aria-hidden />
            Detalhes
          </button>
          <button
            type="button"
            disabled={!ativo || !!erro}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
              aba === "editar"
                ? "bg-od-card text-od-text shadow-sm ring-1 ring-od-border/80 dark:bg-od-surface-muted dark:text-od-text dark:ring-od-border-strong"
                : "text-od-muted hover:bg-od-card/70 hover:text-od-text dark:text-od-muted dark:hover:bg-od-surface-muted/60 dark:hover:text-od-text"
            }`}
            onClick={() => setAba("editar")}
          >
            <Pencil className="size-4 opacity-70" strokeWidth={1.75} aria-hidden />
            Editar
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {erro ? (
            <p className="p-4 text-sm text-red-700 dark:text-red-400" role="alert">
              {erro}
            </p>
          ) : aba === "detalhes" ? (
            <div className="p-4">
              {carregando || !ativo ? (
                <ul className="space-y-2" aria-hidden>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <li
                      key={i}
                      className="h-10 animate-pulse rounded bg-od-surface-muted dark:bg-od-surface"
                    />
                  ))}
                </ul>
              ) : (
                <>
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <StatusAtivoBadge status={ativo.status} />
                    {!ativo.ativo ? (
                      <span className="rounded-md bg-od-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-od-muted dark:bg-od-surface-muted dark:text-od-muted">
                        Inativado
                      </span>
                    ) : null}
                  </div>
                  <dl className="rounded-xl border border-od-border/40 bg-od-surface-soft/40 px-3 dark:border-od-border/80 dark:bg-od-surface/25">
                    <DetalheLinha rotulo="Série" valor={ativo.numeroSerie} />
                    <DetalheLinha rotulo="Categoria" valor={ativo.categoria} />
                    <DetalheLinha rotulo="Marca" valor={ativo.marca} />
                    <DetalheLinha rotulo="Modelo" valor={ativo.modelo} />
                    <DetalheLinha rotulo="Descrição" valor={ativo.descricao} />
                    <DetalheLinha rotulo="Setor" valor={ativo.setor} />
                    <DetalheLinha rotulo="Local" valor={ativo.localizacao} />
                    <DetalheLinha rotulo="Responsável" valor={ativo.responsavel} />
                    <DetalheLinha rotulo="Observações" valor={ativo.observacoes} />
                    <DetalheLinha rotulo="Criado" valor={formatDateTime(ativo.criadoEm)} />
                    <DetalheLinha rotulo="Atualizado" valor={formatDateTime(ativo.atualizadoEm)} />
                  </dl>
                </>
              )}
            </div>
          ) : aba === "editar" ? (
            carregando || !ativo ? (
              <div className="p-4">
                <ul className="space-y-2" aria-hidden>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <li
                      key={i}
                      className="h-12 animate-pulse rounded bg-od-surface-muted dark:bg-od-surface"
                    />
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 dark:border-od-border/80">
                <AtivoForm
                  modo="editar"
                  ativoId={ativo.id}
                  initial={ativo}
                  embedded
                  onSaved={(atualizado) => {
                    setAtivo(atualizado);
                    setAba("detalhes");
                    onSaved?.();
                  }}
                  onCancelEdit={() => setAba("detalhes")}
                />
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
