"use client";

import { useCallback, useEffect, useState } from "react";
import { X, FileText, Pencil } from "lucide-react";
import { buscarAtivo } from "@/services/api/ativosApi";
import { formatDateTime } from "@/utils/formatters";
import StatusAtivoBadge from "./StatusAtivoBadge";
import AtivoForm from "./AtivoForm";

function DetalheLinha({ rotulo, valor }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-1 border-b border-zinc-100 py-2.5 text-sm last:border-0 dark:border-zinc-800/80">
      <dt className="shrink-0 font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{rotulo}</dt>
      <dd className="min-w-0 break-words text-zinc-900 dark:text-zinc-100">{valor ?? "—"}</dd>
    </div>
  );
}

export default function PatrimonioSlideOver({ open, ativoId, initialTab = "detalhes", onClose, onSaved }) {
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
      aria-labelledby="patrimonio-slide-titulo"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/45 transition-opacity duration-200 dark:bg-black/55"
        aria-label="Fechar painel"
        onClick={onClose}
      />
      <div
        className="relative flex h-full w-full max-w-[26rem] flex-col border-l border-zinc-200 bg-white shadow-[inset_1px_0_0_0_rgb(0_0_0/0.03)] transition-transform duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-md md:max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
              {ativo?.numeroPatrimonio ?? "…"}
            </p>
            <h2 id="patrimonio-slide-titulo" className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {carregando ? "Carregando…" : ativo?.nome ?? "Patrimônio"}
            </h2>
          </div>
          <button
            type="button"
            className="rounded border border-transparent p-1.5 text-zinc-500 transition-colors hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="flex shrink-0 gap-0 border-b border-zinc-200 px-2 dark:border-zinc-800">
          <button
            type="button"
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              aba === "detalhes"
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-50"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
            onClick={() => setAba("detalhes")}
          >
            <FileText className="size-4 opacity-70" strokeWidth={1.75} aria-hidden />
            Detalhes
          </button>
          <button
            type="button"
            disabled={!ativo || !!erro}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${
              aba === "editar"
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-50"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
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
                    <li key={i} className="h-10 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
                  ))}
                </ul>
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <StatusAtivoBadge status={ativo.status} />
                    {!ativo.ativo ? (
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Inativado</span>
                    ) : null}
                  </div>
                  <dl>
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
                    <li key={i} className="h-12 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
                  ))}
                </ul>
              </div>
            ) : (
              <div className="border-t border-zinc-100 p-4 dark:border-zinc-800/80">
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
