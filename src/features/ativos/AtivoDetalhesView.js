"use client";

import Link from "next/link";
import { formatDateTime } from "@/utils/formatters";
import StatusAtivoBadge from "./StatusAtivoBadge";

function Campo({ rotulo, valor, wide = false }) {
  return (
    <div
      className={`rounded-xl border border-od-border/90 bg-od-surface-soft/50 px-4 py-3 dark:border-od-border dark:bg-od-surface/30 ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-od-muted">{rotulo}</p>
      <p className="mt-1 break-words text-sm font-medium leading-snug text-od-text">{valor}</p>
    </div>
  );
}

function Secao({ id, titulo, intro, children }) {
  return (
    <section
      className="rounded-2xl border border-od-border/90 bg-od-card p-5 shadow-sm dark:border-od-border dark:bg-od-bg"
      aria-labelledby={id}
    >
      <h2 id={id} className="text-[11px] font-semibold uppercase tracking-[0.08em] text-od-muted">
        {titulo}
      </h2>
      {intro ? <p className="mt-2 text-sm leading-relaxed text-od-muted">{intro}</p> : null}
      {children}
    </section>
  );
}

export default function AtivoDetalhesView({ ativo }) {
  if (!ativo) return null;

  return (
    <div className="anim-fade-stack mx-auto max-w-[920px] px-4 pb-20 pt-4 text-od-text">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href="/ativos"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-od-border bg-od-card px-4 text-sm font-medium text-od-text-soft shadow-sm transition-colors hover:bg-od-surface-soft dark:border-od-border-strong dark:bg-od-surface dark:text-od-text dark:hover:bg-od-surface-muted"
        >
          Voltar
        </Link>
        <Link
          href={`/ativos/${ativo.id}/editar`}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-od-text bg-od-text px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-od-text/90 dark:border-od-border/40 dark:bg-od-surface-muted dark:text-od-text dark:hover:bg-od-border/30"
        >
          Editar
        </Link>
      </div>

      <header className="mb-6 rounded-2xl border border-od-border/90 bg-gradient-to-b from-od-surface-soft/95 to-od-card p-6 shadow-sm dark:border-od-border dark:from-od-surface/80 dark:to-od-bg">
        <p className="font-mono text-[11px] tabular-nums tracking-tight text-od-muted">
          {ativo.numeroPatrimonio}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-od-text [font-family:var(--font-display)]">
          {ativo.nome}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusAtivoBadge status={ativo.status} />
          {!ativo.ativo ? (
            <span className="rounded-md bg-od-border/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-od-text-soft dark:bg-od-surface-muted dark:text-od-text-soft">
              Cadastro inativado
            </span>
          ) : null}
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <Secao id="sec-id" titulo="Identificação">
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Campo rotulo="Série" valor={ativo.numeroSerie || "—"} />
            <Campo rotulo="Categoria" valor={ativo.categoria || "—"} />
            <Campo rotulo="Marca" valor={ativo.marca || "—"} />
            <Campo rotulo="Modelo" valor={ativo.modelo || "—"} />
            <Campo rotulo="Descrição" valor={ativo.descricao || "—"} wide />
          </div>
        </Secao>

        <Secao id="sec-sit" titulo="Situação">
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-od-border/90 bg-od-surface-soft/50 px-4 py-3 dark:border-od-border dark:bg-od-surface/30">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-od-muted">
                Status atual
              </p>
              <div className="mt-2">
                <StatusAtivoBadge status={ativo.status} />
              </div>
            </div>
          </div>
        </Secao>

        <Secao
          id="sec-empresa"
          titulo="Uso interno na empresa"
          intro="Alocação a setores e pessoas — não representa venda nem saída definitiva para fora."
        >
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Campo rotulo="Setor / departamento" valor={ativo.setor || "—"} />
            <Campo rotulo="Localização" valor={ativo.localizacao || "—"} />
            <Campo rotulo="Responsável no momento" valor={ativo.responsavel || "—"} wide />
          </div>
        </Secao>

        <Secao id="sec-obs" titulo="Observações">
          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-od-text">
            {ativo.observacoes || "—"}
          </p>
        </Secao>

        <Secao id="sec-meta" titulo="Registro no sistema">
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Campo rotulo="Primeira inclusão no controle" valor={formatDateTime(ativo.criadoEm)} />
            <Campo rotulo="Última alteração" valor={formatDateTime(ativo.atualizadoEm)} />
            <Campo
              rotulo="Registro ativo"
              valor={ativo.ativo ? "Sim" : "Não (inativado nas listagens padrão)"}
              wide
            />
          </div>
        </Secao>

        <section
          className="rounded-2xl border border-dashed border-od-border-strong/90 bg-od-surface-soft/50 p-5 dark:border-od-border-strong dark:bg-od-surface/25"
          aria-labelledby="sec-hist"
        >
          <h2 id="sec-hist" className="text-sm font-semibold text-od-text">
            Movimentações entre setores
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-od-muted">
            Histórico detalhado de entradas e transferências será exibido aqui futuramente. Por
            enquanto, atualize setor, local e responsável ao mudar o destino do bem.
          </p>
        </section>
      </div>
    </div>
  );
}
