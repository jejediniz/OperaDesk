"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  FilterX,
  Package,
  Pencil,
  Plus,
  Ban,
  Search
} from "lucide-react";
import { useConfirm } from "@/contexts/confirmContext";
import { useToast } from "@/contexts/toastContext";
import { STATUS_ATIVO, STATUS_ATIVO_LABEL, CATEGORIAS_ATIVO_SUGESTOES } from "@/constants/ativos";
import {
  exportarAtivosCsv,
  inativarAtivo,
  inativarAtivosEmMassa,
  listarAtivos,
  obterResumoAtivos
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
  INATIVADOS: "inativados"
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
      minute: "2-digit"
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
  STATUS_ATIVO.BAIXADO
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
    visibilidade !== VISIBILIDADE.ATIVOS
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
  }, [
    buscaDebounced,
    statusFiltro,
    categoriaFiltro,
    visibilidade,
    ordenar,
    ordem,
    pagina,
    limitePagina
  ]);

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
          page: pagina
        }),
        obterResumoAtivos()
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
  }, [
    buscaDebounced,
    statusFiltro,
    categoriaFiltro,
    visibilidade,
    ordenar,
    ordem,
    pagina,
    limitePagina
  ]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    setPagina(1);
  }, [buscaDebounced, statusFiltro, categoriaFiltro, visibilidade, limitePagina, ordenar, ordem]);

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
        ordem
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
      confirmLabel: "Inativar"
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
      toast.error(
        `É possível inativar no máximo ${BULK_MAX_IDS} itens por lote. Reduza a seleção.`
      );
      return;
    }
    const ok = await confirm({
      title: `Inativar ${ativosAlvo.length} registro${ativosAlvo.length === 1 ? "" : "s"}`,
      description: "Os itens deixam de aparecer nas buscas habituais.",
      confirmLabel: "Inativar todos"
    });
    if (!ok) return;
    try {
      const resultado = await inativarAtivosEmMassa(ativosAlvo.map((r) => r.id));
      const alt = typeof resultado?.alterados === "number" ? resultado.alterados : 0;
      if (alt === 0) {
        toast.error("Nenhum registro pôde ser inativado.");
      } else {
        toast.success(
          `${alt} registro${alt === 1 ? "" : "s"} inativado${alt === 1 ? "" : "s"} em lote.`
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
      [STATUS_ATIVO.BAIXADO]: r.baixado ?? 0
    };
    return STATUS_ORDER.map((key) =>
      key === "todos"
        ? { key: "todos", label: "Todos", count: r.totalCadastrados ?? 0 }
        : { key, label: STATUS_ATIVO_LABEL[key], count: porStatus[key] ?? 0 }
    );
  }, [resumo]);

  const idsNaPagina = useMemo(() => itensLista.map((r) => r.id), [itensLista]);
  const todosMarcados = idsNaPagina.length > 0 && idsNaPagina.every((id) => selecionados.has(id));
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
    [itensLista, selecionados]
  );

  const bulkInativarBloqueado =
    ativosSelecionadosNaPagina === 0 || ativosSelecionadosNaPagina > BULK_MAX_IDS;

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
    <div className="patrimonio-page">
      <header className="patrimonio-hero">
        <div className="patrimonio-hero__copy">
          <span className="patrimonio-hero__icon" aria-hidden>
            <Package size={22} strokeWidth={1.8} />
          </span>
          <div>
            <p className="patrimonio-hero__eyebrow">Inventário corporativo</p>
            <h1>Patrimônio</h1>
            <p>
              Consulte bens, acompanhe situação e faça ações administrativas sem perder contexto.
            </p>
          </div>
        </div>
        <div className="patrimonio-hero__actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCsv}
            disabled={exportando}
          >
            <Download size={16} strokeWidth={1.8} aria-hidden />
            {exportando ? "Exportando..." : "Exportar CSV"}
          </button>
          <Link href="/ativos/novo" className="btn btn-primary">
            <Plus size={16} strokeWidth={1.8} aria-hidden />
            Registrar bem
          </Link>
        </div>
      </header>

      <section className="patrimonio-summary" aria-label="Resumo do patrimônio">
        {abas.map((a) => (
          <button
            key={a.key}
            type="button"
            className={`patrimonio-summary-card${statusFiltro === a.key ? " is-active" : ""}`}
            onClick={() => setStatusFiltro(a.key)}
            aria-pressed={statusFiltro === a.key}
          >
            <span>{a.label}</span>
            <strong>{a.count}</strong>
          </button>
        ))}
      </section>

      <section className="patrimonio-workspace">
        <aside className="patrimonio-filters" aria-label="Filtros de patrimônio">
          <div className="patrimonio-filters__header">
            <div>
              <h2>Filtros</h2>
              <p>Use poucos critérios por vez para encontrar o bem mais rápido.</p>
            </div>
            {filtrosAtivos ? (
              <button type="button" className="patrimonio-clear-btn" onClick={limparFiltros}>
                <FilterX size={15} strokeWidth={1.9} aria-hidden />
                Limpar
              </button>
            ) : null}
          </div>

          <label className="field">
            <span className="field-label">Busca</span>
            <span className="patrimonio-search">
              <Search size={16} strokeWidth={1.8} aria-hidden />
              <input
                ref={buscaRef}
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome ou patrimônio"
                autoComplete="off"
                aria-label="Buscar na lista de patrimônio"
              />
            </span>
            {busca !== buscaDebounced ? (
              <span className="field-helper">Aplicando busca...</span>
            ) : null}
          </label>

          <label className="field">
            <span className="field-label">Situação</span>
            <select
              className="select-field"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            >
              {abas.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label} ({a.count})
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Categoria</span>
            <select
              className="select-field"
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

          <label className="field">
            <span className="field-label">Exibir</span>
            <select
              className="select-field"
              value={visibilidade}
              onChange={(e) => setVisibilidade(e.target.value)}
            >
              <option value={VISIBILIDADE.ATIVOS}>Somente ativos</option>
              <option value={VISIBILIDADE.TODOS}>Ativos e inativados</option>
              <option value={VISIBILIDADE.INATIVADOS}>Somente inativados</option>
            </select>
          </label>

          <div className="patrimonio-filter-grid">
            <label className="field">
              <span className="field-label">Ordenar por</span>
              <select
                className="select-field"
                value={ordenar}
                onChange={(e) => {
                  setOrdenar(e.target.value);
                  setOrdem(e.target.value === "nome" ? "asc" : "desc");
                }}
              >
                <option value="atualizadoEm">Atualização</option>
                <option value="nome">Nome</option>
                <option value="categoria">Categoria</option>
                <option value="status">Situação</option>
              </select>
            </label>
            <button
              type="button"
              className="btn btn-secondary patrimonio-order-btn"
              onClick={() => setOrdem((o) => (o === "asc" ? "desc" : "asc"))}
              aria-label={ordem === "asc" ? "Ordenação crescente" : "Ordenação decrescente"}
            >
              {ordem === "asc" ? (
                <ArrowUp size={16} strokeWidth={1.8} aria-hidden />
              ) : (
                <ArrowDown size={16} strokeWidth={1.8} aria-hidden />
              )}
              {ordem === "asc" ? "Crescente" : "Decrescente"}
            </button>
          </div>
        </aside>

        <div className="patrimonio-results">
          <div className="patrimonio-results__header">
            <div>
              <h2>Lista de bens</h2>
              <p>{meta ? intervaloTexto : "Carregando registros..."}</p>
            </div>
            <label className="patrimonio-page-size">
              <span>Por página</span>
              <select
                value={limitePagina}
                onChange={(e) => setLimitePagina(Number(e.target.value))}
              >
                {LIMITES_PAGINA.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {erro ? (
            <div className="patrimonio-alert" role="alert">
              {erro}
            </div>
          ) : null}

          <div className="patrimonio-table-wrap">
            {carregando && !itensLista.length ? (
              <div className="patrimonio-loading-list" aria-busy="true">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
            ) : itensLista.length === 0 ? (
              <div className="patrimonio-empty">
                {filtrosAtivos ? (
                  <EmptyState
                    title="Nada encontrado"
                    description="Ajuste busca, situação, categoria ou exibição."
                    actionLabel="Limpar filtros"
                    onAction={limparFiltros}
                  />
                ) : (
                  <EmptyState
                    title="Nenhum bem cadastrado"
                    description="Comece registrando o primeiro item do patrimônio."
                    actionLabel="Registrar bem"
                    onAction={() => router.push("/ativos/novo")}
                  />
                )}
              </div>
            ) : (
              <table className="patrimonio-clean-table">
                <thead>
                  <tr>
                    <th className="patrimonio-clean-table__check">
                      <input
                        ref={headerCheckboxRef}
                        type="checkbox"
                        checked={todosMarcados}
                        onChange={alternarTodosNaPagina}
                        aria-label="Selecionar todos nesta página"
                      />
                    </th>
                    <th>Bem</th>
                    <th>Situação</th>
                    <th>Local / responsável</th>
                    <th>Atualizado</th>
                    <th className="patrimonio-clean-table__actions">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {itensLista.map((row) => {
                    const { linha1, resp } = formatLocalizacao(row);
                    return (
                      <tr
                        key={row.id}
                        className={!row.ativo ? "is-muted" : ""}
                        onClick={() => setPainel({ id: row.id, aba: "detalhes" })}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selecionados.has(row.id)}
                            onChange={() => alternarSelecionado(row.id)}
                            aria-label={`Selecionar ${row.nome}`}
                          />
                        </td>
                        <td>
                          <div className="patrimonio-item-title">{row.nome}</div>
                          <div className="patrimonio-item-meta">
                            <code>{row.numeroPatrimonio}</code>
                            {row.categoria ? <span>{row.categoria}</span> : null}
                            {[row.marca, row.modelo].filter(Boolean).length ? (
                              <span>{[row.marca, row.modelo].filter(Boolean).join(" · ")}</span>
                            ) : null}
                          </div>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="patrimonio-status-stack">
                            <StatusAtivoBadge status={row.status} />
                            {!row.ativo ? <span>Inativado</span> : null}
                          </div>
                        </td>
                        <td>
                          {!linha1 && !resp ? (
                            <span className="patrimonio-muted">Sem local definido</span>
                          ) : (
                            <div className="patrimonio-location">
                              {linha1 ? <strong>{linha1}</strong> : null}
                              {resp ? <span>Responsável: {resp}</span> : null}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="patrimonio-date">
                            {formatAtualizado(row.atualizadoEm)}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="patrimonio-row-actions">
                            <button
                              type="button"
                              className="patrimonio-icon-btn"
                              aria-label="Editar"
                              onClick={() => setPainel({ id: row.id, aba: "editar" })}
                            >
                              <Pencil size={16} strokeWidth={1.8} />
                            </button>
                            {row.ativo ? (
                              <button
                                type="button"
                                className="patrimonio-icon-btn patrimonio-icon-btn--danger"
                                aria-label="Inativar"
                                onClick={() => handleInativar(row)}
                              >
                                <Ban size={16} strokeWidth={1.8} />
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
            <div className="patrimonio-pagination">
              <div className="patrimonio-pagination__meta">
                <strong>
                  Página {meta.page} de {totalPaginas}
                </strong>
                <span>{intervaloTexto}</span>
              </div>
              <label className="patrimonio-jump">
                <span>Ir para</span>
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
                  placeholder={`1-${totalPaginas}`}
                  aria-label="Ir para página"
                />
              </label>
              <div className="patrimonio-pagination__actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                >
                  Próxima
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {selecionados.size > 0 ? (
        <div className="patrimonio-selection-bar">
          <div>
            <strong>{selecionados.size}</strong>{" "}
            {selecionados.size === 1 ? "item selecionado" : "itens selecionados"}
            {ativosSelecionadosNaPagina > BULK_MAX_IDS ? (
              <span>Limite de inativação em lote: {BULK_MAX_IDS} itens ativos.</span>
            ) : null}
          </div>
          <div className="patrimonio-selection-bar__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelecionados(new Set())}
            >
              Limpar seleção
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={bulkInativarBloqueado}
              onClick={handleBulkInativar}
            >
              Inativar selecionados
            </button>
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
