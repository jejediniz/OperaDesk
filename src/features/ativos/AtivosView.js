"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Download, Pencil, Plus, Ban, Search } from "lucide-react";
import { useConfirm } from "@/contexts/confirmContext";
import { useToast } from "@/contexts/toastContext";
import {
  STATUS_ATIVO,
  STATUS_ATIVO_LABEL,
  CATEGORIAS_ATIVO_SUGESTOES,
} from "@/constants/ativos";
import {
  exportarAtivosCsv,
  inativarAtivo,
  inativarAtivosEmMassa,
  listarAtivos,
  obterResumoAtivos,
} from "@/services/api/ativosApi";
import { EmptyState } from "@/components/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import StatusAtivoBadge from "./StatusAtivoBadge";
import PatrimonioSlideOver from "./PatrimonioSlideOver";

const LIMITES_PAGINA = [25, 50, 100, 200];

const BULK_MAX_IDS = 200;

const VISIBILIDADE = {
  ATIVOS: "ativos",
  TODOS: "todos",
  INATIVADOS: "inativados",
};

function paramsVisibilidade(vis) {
  if (vis === VISIBILIDADE.TODOS) return { incluirInativos: true, somenteInativos: false };
  if (vis === VISIBILIDADE.INATIVADOS) return { incluirInativos: false, somenteInativos: true };
  return { incluirInativos: false, somenteInativos: false };
}

function formatAtualizado(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

const STATUS_ORDER = [
  "todos",
  STATUS_ATIVO.DISPONIVEL,
  STATUS_ATIVO.EM_USO,
  STATUS_ATIVO.EM_MANUTENCAO,
  STATUS_ATIVO.DANIFICADO,
  STATUS_ATIVO.EXTRAVIADO,
  STATUS_ATIVO.BAIXADO,
];

function formatLocalizacao(row) {
  const partes = [row.setor, row.localizacao].filter(Boolean);
  const linha1 = partes.length ? partes.join(" · ") : null;
  const resp = row.responsavel?.trim();
  return { linha1, resp };
}

export default function AtivosView() {
  const router = useRouter();
  const headerCheckboxRef = useRef(null);
  const buscaRef = useRef(null);

  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebouncedValue(busca, 280);
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [visibilidade, setVisibilidade] = useState(VISIBILIDADE.ATIVOS);
  const [ordenar, setOrdenar] = useState("atualizadoEm");
  const [ordem, setOrdem] = useState("desc");
  const [pagina, setPagina] = useState(1);
  const [limitePagina, setLimitePagina] = useState(50);
  const [irPaginaTexto, setIrPaginaTexto] = useState("");
  const [exportando, setExportando] = useState(false);

  const [itens, setItens] = useState([]);
  const [meta, setMeta] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [selecionados, setSelecionados] = useState(() => new Set());
  const [painel, setPainel] = useState({ id: null, aba: "detalhes" });

  const { confirm } = useConfirm();
  const toast = useToast();

  const filtrosAtivos = Boolean(
    (buscaDebounced || "").trim() ||
      categoriaFiltro.trim() ||
      statusFiltro !== "todos" ||
      visibilidade !== VISIBILIDADE.ATIVOS,
  );

  const limparFiltros = useCallback(() => {
    setBusca("");
    setCategoriaFiltro("");
    setStatusFiltro("todos");
    setVisibilidade(VISIBILIDADE.ATIVOS);
    setPagina(1);
  }, []);

  useEffect(() => {
    setSelecionados(new Set());
  }, [buscaDebounced, statusFiltro, categoriaFiltro, visibilidade, ordenar, ordem, pagina, limitePagina]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const vis = paramsVisibilidade(visibilidade);
      const [lista, sum] = await Promise.all([
        listarAtivos({
          q: (buscaDebounced || "").trim() || undefined,
          status: statusFiltro !== "todos" ? statusFiltro : undefined,
          categoria: categoriaFiltro.trim() || undefined,
          ...vis,
          ordenar,
          ordem,
          limit: limitePagina,
          page: pagina,
        }),
        obterResumoAtivos(),
      ]);
      setItens(Array.isArray(lista?.items) ? lista.items : []);
      setMeta(lista?.meta ?? null);
      setResumo(sum);
    } catch (e) {
      const msg =
        e instanceof Error && typeof e.message === "string" && e.message.trim()
          ? e.message.trim()
          : typeof e === "string" && e.trim()
            ? e.trim()
            : "Erro ao carregar ativos.";
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }, [buscaDebounced, statusFiltro, categoriaFiltro, visibilidade, ordenar, ordem, pagina, limitePagina]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    setPagina(1);
  }, [buscaDebounced, statusFiltro, categoriaFiltro, visibilidade, limitePagina, ordenar, ordem]);

  function handleSortColumn(col) {
    if (ordenar === col) {
      setOrdem((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setOrdenar(col);
      setOrdem(col === "nome" ? "asc" : "desc");
    }
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      const tag = t?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || t?.isContentEditable) return;
      e.preventDefault();
      buscaRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function handleExportCsv() {
    if (exportando) return;
    setExportando(true);
    try {
      const vis = paramsVisibilidade(visibilidade);
      const { blob, filename, truncado } = await exportarAtivosCsv({
        q: (buscaDebounced || "").trim() || undefined,
        status: statusFiltro !== "todos" ? statusFiltro : undefined,
        categoria: categoriaFiltro.trim() || undefined,
        ...vis,
        ordenar,
        ordem,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      if (truncado) {
        toast.error("Exportação limitada a 8000 linhas; o arquivo pode estar incompleto.");
      } else {
        toast.success("Arquivo CSV gerado.");
      }
    } catch (e) {
      const msg =
        e instanceof Error && typeof e.message === "string" && e.message.trim()
          ? e.message.trim()
          : "Não foi possível exportar.";
      toast.error(msg);
    } finally {
      setExportando(false);
    }
  }

  async function handleInativar(row) {
    const ok = await confirm({
      title: "Inativar registro",
      description: "O bem deixa de aparecer nas buscas habituais. Deseja continuar?",
      confirmLabel: "Inativar",
    });
    if (!ok) return;
    try {
      await inativarAtivo(row.id);
      toast.success("Registro inativado.");
      carregar();
      setPainel((p) => (p.id === row.id ? { id: null, aba: "detalhes" } : p));
    } catch (e) {
      const msg =
        e instanceof Error && typeof e.message === "string" && e.message.trim()
          ? e.message.trim()
          : typeof e === "string" && e.trim()
            ? e.trim()
            : "Não foi possível inativar.";
      toast.error(msg);
    }
  }

  async function handleBulkInativar() {
    const ativosAlvo = itens.filter((x) => selecionados.has(x.id) && x.ativo);
    if (!ativosAlvo.length) {
      toast.error("Nenhum registro ativo selecionado.");
      return;
    }
    if (ativosAlvo.length > BULK_MAX_IDS) {
      toast.error(`É possível inativar no máximo ${BULK_MAX_IDS} itens por lote. Reduza a seleção.`);
      return;
    }
    const ok = await confirm({
      title: `Inativar ${ativosAlvo.length} registro${ativosAlvo.length === 1 ? "" : "s"}`,
      description: "Os itens deixam de aparecer nas buscas habituais.",
      confirmLabel: "Inativar todos",
    });
    if (!ok) return;
    try {
      const resultado = await inativarAtivosEmMassa(ativosAlvo.map((r) => r.id));
      const alt = typeof resultado?.alterados === "number" ? resultado.alterados : 0;
      if (alt === 0) {
        toast.error("Nenhum registro pôde ser inativado.");
      } else {
        toast.success(
          `${alt} registro${alt === 1 ? "" : "s"} inativado${alt === 1 ? "" : "s"} em lote.`,
        );
        if (alt < ativosAlvo.length) {
          toast.error("Parte da seleção já estava inativa.");
        }
      }
    } catch (e) {
      const msg =
        e instanceof Error && typeof e.message === "string" && e.message.trim()
          ? e.message.trim()
          : "Não foi possível inativar em lote.";
      toast.error(msg);
    }
    carregar();
    setSelecionados(new Set());
  }

  const itensLista = useMemo(() => (Array.isArray(itens) ? itens : []), [itens]);

  const categoriasLista = useMemo(() => {
    const uniq = new Set(CATEGORIAS_ATIVO_SUGESTOES);
    for (const it of itensLista) {
      if (it.categoria?.trim()) uniq.add(it.categoria.trim());
    }
    return [...uniq].sort((a, b) => a.localeCompare(b));
  }, [itensLista]);

  const abas = useMemo(() => {
    const r = resumo || {};
    const porStatus = {
      [STATUS_ATIVO.DISPONIVEL]: r.disponivel ?? 0,
      [STATUS_ATIVO.EM_USO]: r.emUso ?? 0,
      [STATUS_ATIVO.EM_MANUTENCAO]: r.emManutencao ?? 0,
      [STATUS_ATIVO.DANIFICADO]: r.danificado ?? 0,
      [STATUS_ATIVO.EXTRAVIADO]: r.extraviado ?? 0,
      [STATUS_ATIVO.BAIXADO]: r.baixado ?? 0,
    };
    return STATUS_ORDER.map((key) =>
      key === "todos"
        ? { key: "todos", label: "Todos", count: r.totalCadastrados ?? 0 }
        : { key, label: STATUS_ATIVO_LABEL[key], count: porStatus[key] ?? 0 },
    );
  }, [resumo]);

  const idsNaPagina = useMemo(() => itensLista.map((r) => r.id), [itensLista]);
  const todosMarcados =
    idsNaPagina.length > 0 && idsNaPagina.every((id) => selecionados.has(id));
  const algunsMarcados = idsNaPagina.some((id) => selecionados.has(id)) && !todosMarcados;

  useEffect(() => {
    const el = headerCheckboxRef.current;
    if (el) el.indeterminate = algunsMarcados;
  }, [algunsMarcados]);

  function alternarSelecionado(id) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function alternarTodosNaPagina() {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (todosMarcados) idsNaPagina.forEach((id) => next.delete(id));
      else idsNaPagina.forEach((id) => next.add(id));
      return next;
    });
  }

  const ativosSelecionadosNaPagina = useMemo(
    () => itensLista.filter((x) => selecionados.has(x.id) && x.ativo).length,
    [itensLista, selecionados],
  );

  const bulkInativarBloqueado = ativosSelecionadosNaPagina === 0 || ativosSelecionadosNaPagina > BULK_MAX_IDS;

  const intervaloTexto = useMemo(() => {
    if (!meta?.total && meta?.total !== 0) return "";
    const lim = meta.limit || limitePagina;
    const p = meta.page || 1;
    const ini = meta.total === 0 ? 0 : (p - 1) * lim + 1;
    const fim = Math.min(p * lim, meta.total);
    return `${ini} a ${fim} de ${meta.total}`;
  }, [meta, limitePagina]);

  const totalPaginas = meta?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-28 pt-2 text-zinc-900 dark:text-zinc-100">
      <div className="mb-4 flex flex-col gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-950 [font-family:var(--font-display)] dark:text-zinc-50">
            Patrimônio
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Inventário corporativo com paginação e ações em massa. Busca integrada à tabela.
          </p>
        </div>
        <Link
          href="/ativos/novo"
          className="inline-flex items-center justify-center gap-1.5 border border-zinc-900 bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="size-4" strokeWidth={1.75} aria-hidden />
          Registrar bem
        </Link>
      </div>

      <div
        className="mb-3 flex gap-0 overflow-x-auto border border-b-0 border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40"
        role="tablist"
        aria-label="Situação do bem"
      >
        {abas.map((a) => (
          <button
            key={a.key}
            type="button"
            role="tab"
            aria-selected={statusFiltro === a.key}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-left text-sm transition-colors ${
              statusFiltro === a.key
                ? "border-zinc-900 bg-white font-semibold text-zinc-900 dark:border-zinc-100 dark:bg-zinc-950 dark:text-zinc-50"
                : "border-transparent text-zinc-600 hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-950/60 dark:hover:text-zinc-200"
            }`}
            onClick={() => setStatusFiltro(a.key)}
          >
            <span className="whitespace-nowrap">{a.label}</span>
            <span
              className={`ml-1.5 tabular-nums text-xs font-medium ${
                statusFiltro === a.key ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {a.count}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-0 flex flex-wrap items-end gap-3 border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="block min-w-[10rem] flex-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Categoria
          <select
            className="mt-1 block w-full max-w-xs border border-zinc-200 bg-white py-1.5 pl-2 pr-8 text-sm font-normal normal-case text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas</option>
            {categoriasLista.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="min-w-[14rem] text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          <span className="block">Exibição</span>
          <div
            className="mt-1 flex flex-wrap gap-1 normal-case"
            role="group"
            aria-label="Filtrar por registro ativo ou inativo"
          >
            {[
              { key: VISIBILIDADE.ATIVOS, label: "Só ativos" },
              { key: VISIBILIDADE.TODOS, label: "Todos" },
              {
                key: VISIBILIDADE.INATIVADOS,
                label: `Inativados${typeof resumo?.totalInativados === "number" ? ` (${resumo.totalInativados})` : ""}`,
              },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`border px-2 py-1 text-xs font-medium transition-colors ${
                  visibilidade === opt.key
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-600"
                }`}
                onClick={() => setVisibilidade(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {filtrosAtivos ? (
          <button
            type="button"
            className="mb-0.5 border border-transparent px-2 py-1 text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
            onClick={limparFiltros}
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-white px-2 py-2 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="relative min-w-[12rem] flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              ref={buscaRef}
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar… (/ para focar)"
              autoComplete="off"
              className="w-full border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:bg-zinc-950"
            />
          </div>
          {busca !== buscaDebounced ? (
            <span className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-400">Aplicando busca…</span>
          ) : null}
          {meta ? (
            <span className="shrink-0 tabular-nums text-xs text-zinc-500 dark:text-zinc-400">{intervaloTexto}</span>
          ) : null}
        </div>

        {erro ? (
          <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {erro}
          </div>
        ) : null}

        <div className="max-h-[min(70vh,780px)] overflow-auto">
          {carregando && !itensLista.length ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800" aria-busy="true">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex animate-pulse gap-3 px-2 py-2">
                  <div className="h-4 w-4 shrink-0 rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-4 flex-1 rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-4 w-40 rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-4 w-28 rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
              ))}
            </div>
          ) : itensLista.length === 0 ? (
            <div className="p-6">
              {filtrosAtivos ? (
                <EmptyState
                  title="Nada encontrado"
                  description="Ajuste a busca, a situação ou a exibição (ativos / todos / inativados)."
                  actionLabel="Limpar filtros"
                  onAction={limparFiltros}
                >
                  <div className="mt-4 flex max-w-lg flex-col gap-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                      Sugestões
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                        onClick={() => {
                          setVisibilidade(VISIBILIDADE.TODOS);
                          setPagina(1);
                        }}
                      >
                        Ver ativos e inativados
                      </button>
                      <button
                        type="button"
                        className="border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                        onClick={() => {
                          setStatusFiltro("todos");
                          setPagina(1);
                        }}
                      >
                        Qualquer situação
                      </button>
                      {categoriasLista.slice(0, 4).map((c) => (
                        <button
                          key={c}
                          type="button"
                          className="border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                          onClick={() => {
                            setCategoriaFiltro(c);
                            setPagina(1);
                          }}
                        >
                          Categoria: {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </EmptyState>
              ) : (
                <EmptyState
                  title="Nenhum bem cadastrado"
                  description="Comece pelo botão Registrar bem."
                  actionLabel="Registrar bem"
                  onAction={() => router.push("/ativos/novo")}
                />
              )}
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-100/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95">
                <tr className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <th scope="col" className="w-10 border-b border-zinc-200 px-2 py-2 dark:border-zinc-800">
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={todosMarcados}
                      onChange={alternarTodosNaPagina}
                      aria-label="Selecionar todos nesta página"
                      className="size-3.5 rounded border-zinc-300 text-zinc-900 dark:border-zinc-600"
                    />
                  </th>
                  <th scope="col" className="border-b border-zinc-200 px-2 py-2 dark:border-zinc-800">
                    <button
                      type="button"
                      className="flex w-full items-center justify-start gap-1 text-left font-semibold uppercase tracking-wide text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSortColumn("nome");
                      }}
                    >
                      Item
                      {ordenar === "nome" ? (
                        ordem === "asc" ? (
                          <ArrowUp className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                        ) : (
                          <ArrowDown className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                        )
                      ) : null}
                    </button>
                  </th>
                  <th scope="col" className="border-b border-zinc-200 px-2 py-2 dark:border-zinc-800">
                    <button
                      type="button"
                      className="flex w-full items-center justify-start gap-1 text-left font-semibold uppercase tracking-wide text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSortColumn("categoria");
                      }}
                    >
                      Categoria
                      {ordenar === "categoria" ? (
                        ordem === "asc" ? (
                          <ArrowUp className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                        ) : (
                          <ArrowDown className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                        )
                      ) : null}
                    </button>
                  </th>
                  <th scope="col" className="border-b border-zinc-200 px-2 py-2 dark:border-zinc-800">
                    Localização
                  </th>
                  <th scope="col" className="border-b border-zinc-200 px-2 py-2 dark:border-zinc-800">
                    <button
                      type="button"
                      className="flex w-full items-center justify-start gap-1 text-left font-semibold uppercase tracking-wide text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSortColumn("status");
                      }}
                    >
                      Situação
                      {ordenar === "status" ? (
                        ordem === "asc" ? (
                          <ArrowUp className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                        ) : (
                          <ArrowDown className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                        )
                      ) : null}
                    </button>
                  </th>
                  <th scope="col" className="whitespace-nowrap border-b border-zinc-200 px-2 py-2 dark:border-zinc-800">
                    <button
                      type="button"
                      className="flex w-full items-center justify-start gap-1 text-left font-semibold uppercase tracking-wide text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSortColumn("atualizadoEm");
                      }}
                    >
                      Atualizado
                      {ordenar === "atualizadoEm" ? (
                        ordem === "asc" ? (
                          <ArrowUp className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                        ) : (
                          <ArrowDown className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                        )
                      ) : null}
                    </button>
                  </th>
                  <th scope="col" className="w-24 border-b border-zinc-200 px-2 py-2 text-right dark:border-zinc-800">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                {itensLista.map((row) => {
                  const { linha1, resp } = formatLocalizacao(row);
                  return (
                    <tr
                      key={row.id}
                      className="group cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      onClick={() => setPainel({ id: row.id, aba: "detalhes" })}
                    >
                      <td
                        className={`px-2 py-1.5 ${!row.ativo ? "opacity-60" : ""}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selecionados.has(row.id)}
                          onChange={() => alternarSelecionado(row.id)}
                          aria-label={`Selecionar ${row.nome}`}
                          className="size-3.5 rounded border-zinc-300 text-zinc-900 dark:border-zinc-600"
                        />
                      </td>
                      <td className={`max-w-[220px] px-2 py-1.5 ${!row.ativo ? "opacity-60" : ""}`}>
                        <div className="truncate font-medium text-zinc-900 dark:text-zinc-100">{row.nome}</div>
                        <code className="mt-0.5 inline-block font-mono text-[11px] tabular-nums text-zinc-600 dark:text-zinc-400">
                          {row.numeroPatrimonio}
                        </code>
                        {(row.marca || row.modelo) && (
                          <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-500">
                            {[row.marca, row.modelo].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </td>
                      <td className={`px-2 py-1.5 text-zinc-700 dark:text-zinc-300 ${!row.ativo ? "opacity-60" : ""}`}>
                        <span className="line-clamp-2">{row.categoria || "—"}</span>
                      </td>
                      <td className={`max-w-[200px] px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 ${!row.ativo ? "opacity-60" : ""}`}>
                        {!linha1 && !resp ? (
                          "—"
                        ) : (
                          <>
                            {linha1 ? <div className="line-clamp-2">{linha1}</div> : null}
                            {resp ? <div className="text-zinc-500 dark:text-zinc-500">Resp. {resp}</div> : null}
                          </>
                        )}
                      </td>
                      <td className={`px-2 py-1.5 ${!row.ativo ? "opacity-60" : ""}`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap items-center gap-1">
                          <StatusAtivoBadge status={row.status} />
                          {!row.ativo ? (
                            <span className="text-[10px] font-medium uppercase text-zinc-400">inativo</span>
                          ) : null}
                        </div>
                      </td>
                      <td
                        className={`whitespace-nowrap px-2 py-1.5 text-xs tabular-nums text-zinc-600 dark:text-zinc-400 ${!row.ativo ? "opacity-60" : ""}`}
                      >
                        {formatAtualizado(row.atualizadoEm)}
                      </td>
                      <td className="px-2 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 has-[:focus-visible]:opacity-100">
                          <button
                            type="button"
                            className="rounded border border-transparent p-1.5 text-zinc-500 hover:border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            aria-label="Editar"
                            onClick={() => setPainel({ id: row.id, aba: "editar" })}
                          >
                            <Pencil className="size-4" strokeWidth={1.75} />
                          </button>
                          {row.ativo ? (
                            <button
                              type="button"
                              className="rounded border border-transparent p-1.5 text-zinc-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:border-red-900 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                              aria-label="Inativar"
                              onClick={() => handleInativar(row)}
                            >
                              <Ban className="size-4" strokeWidth={1.75} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {meta && !erro ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-zinc-600 dark:text-zinc-400">
                Página {meta.page} de {totalPaginas}
              </span>
              <span className="tabular-nums text-xs text-zinc-500 dark:text-zinc-500">{intervaloTexto}</span>
              <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Ir para
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={irPaginaTexto}
                  onChange={(e) => setIrPaginaTexto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    const n = parseInt(irPaginaTexto, 10);
                    if (!Number.isFinite(n)) return;
                    setPagina(Math.min(totalPaginas, Math.max(1, n)));
                    setIrPaginaTexto("");
                  }}
                  placeholder={`1–${totalPaginas}`}
                  className="w-16 border border-zinc-200 bg-white px-1.5 py-1 text-center text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  aria-label="Ir para página"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Por página
                </span>
                <select
                  value={limitePagina}
                  onChange={(e) => setLimitePagina(Number(e.target.value))}
                  className="border border-zinc-200 bg-white py-1 pl-2 pr-6 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {LIMITES_PAGINA.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={exportando}
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 border border-zinc-200 bg-white px-3 py-1 text-sm font-medium disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <Download className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                {exportando ? "Exportando…" : "Exportar CSV"}
              </button>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={pagina <= 1}
                  className="border border-zinc-200 bg-white px-3 py-1 text-sm disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={pagina >= totalPaginas}
                  className="border border-zinc-200 bg-white px-3 py-1 text-sm disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {selecionados.size > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-1px_0_0_rgb(0_0_0/0.06)] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {selecionados.size} selecionado{selecionados.size === 1 ? "" : "s"} nesta página
              {ativosSelecionadosNaPagina > BULK_MAX_IDS ? (
                <span className="mt-1 block text-xs font-normal text-amber-700 dark:text-amber-400">
                  Limite de inativação em lote: {BULK_MAX_IDS} itens ativos. Reduza a seleção.
                </span>
              ) : null}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
                onClick={() => setSelecionados(new Set())}
              >
                Limpar seleção
              </button>
              <button
                type="button"
                disabled={bulkInativarBloqueado}
                className="border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 disabled:cursor-not-allowed disabled:opacity-45 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                onClick={handleBulkInativar}
              >
                Inativar selecionados
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <PatrimonioSlideOver
        open={Boolean(painel.id)}
        ativoId={painel.id}
        initialTab={painel.aba}
        onClose={() => setPainel({ id: null, aba: "detalhes" })}
        onSaved={() => carregar()}
      />
    </div>
  );
}
