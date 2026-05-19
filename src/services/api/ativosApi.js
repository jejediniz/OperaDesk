import http, { HttpError } from "./http";

const EXPORT_FETCH_MS = 60_000;

/**
 * Interpreta `{ success, data, meta }`.
 * Observação: `JSON.stringify` omite campos `undefined`; o servidor deve enviar `data: null` quando vazio,
 * caso contrário a chave `data` some e não dá para confiar só em `"data" in envelope`.
 */
function unwrapPayload(envelope) {
  if (envelope == null || typeof envelope !== "object") {
    return { data: null, meta: null };
  }

  if (Object.prototype.hasOwnProperty.call(envelope, "data")) {
    return {
      data: envelope.data ?? null,
      meta: envelope.meta ?? null
    };
  }

  /* Resposta legada ou corpo não padronizado */
  return { data: envelope, meta: null };
}

export async function obterResumoAtivos() {
  const envelope = await http.get("/ativos/resumo");
  const { data } = unwrapPayload(envelope);
  if (data != null && typeof data === "object") {
    return data;
  }
  return {
    totalCadastrados: 0,
    totalInativados: 0,
    disponivel: 0,
    emUso: 0,
    emManutencao: 0,
    danificado: 0,
    extraviado: 0,
    baixado: 0
  };
}

export async function listarAtivos(params = {}) {
  const envelope = await http.get("/ativos", { params });
  const { data, meta } = unwrapPayload(envelope);
  const items = Array.isArray(data) ? data : [];

  let safeMeta =
    meta != null && typeof meta === "object"
      ? meta
      : {
          total: items.length,
          page: params.page ?? 1,
          limit: params.limit ?? 100,
          totalPages: 1
        };

  if (typeof safeMeta.total !== "number") {
    safeMeta = { ...safeMeta, total: items.length };
  }

  return {
    items,
    meta: safeMeta
  };
}

/**
 * Exporta CSV com os mesmos filtros da listagem (sem paginação; até 8000 linhas no servidor).
 * @returns {Promise<{ blob: Blob; filename: string; truncado: boolean }>}
 */
export async function exportarAtivosCsv(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "page" || key === "limit") continue;
    search.append(key, typeof value === "boolean" ? (value ? "true" : "false") : String(value));
  }
  const qs = search.toString();
  const url = `/api/ativos/export${qs ? `?${qs}` : ""}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EXPORT_FETCH_MS);

  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new HttpError("Tempo de exportação excedido. Tente filtros menores.", { status: 0 });
    }
    throw new HttpError(err?.message || "Erro ao exportar", { status: 0 });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const text = await response.text();
    let message = `Erro ${response.status}`;
    try {
      const j = JSON.parse(text);
      message = j?.error?.message || j?.message || message;
    } catch {
      /* ignore */
    }
    throw new HttpError(message, { status: response.status });
  }

  const truncado = response.headers.get("X-Export-Truncated") === "true";
  const blob = await response.blob();
  const dispo = response.headers.get("Content-Disposition");
  let filename = "ativos-export.csv";
  const m = /filename="([^"]+)"/.exec(dispo || "");
  if (m) filename = m[1];

  return { blob, filename, truncado };
}

export async function buscarAtivo(id) {
  const envelope = await http.get(`/ativos/${id}`);
  const { data } = unwrapPayload(envelope);
  return data ?? null;
}

export async function criarAtivo(dados) {
  const envelope = await http.post("/ativos", dados);
  const { data } = unwrapPayload(envelope);
  if (!data || typeof data !== "object") {
    throw new HttpError("O servidor não devolveu o registro criado.", { status: 0, details: null });
  }
  if (!data.id) {
    throw new HttpError("Resposta incompleta: id do bem ausente.", { status: 0, details: null });
  }
  return data;
}

export async function atualizarAtivo(id, dados) {
  const envelope = await http.put(`/ativos/${id}`, dados);
  const { data } = unwrapPayload(envelope);
  if (!data?.id) {
    throw new HttpError("O servidor não devolveu o registro atualizado.", {
      status: 0,
      details: null
    });
  }
  return data;
}

export async function inativarAtivo(id) {
  const envelope = await http.delete(`/ativos/${id}`);
  const { data } = unwrapPayload(envelope);
  return data;
}

/** Inativa vários ativos em uma chamada (máx. 200 ids). */
export async function inativarAtivosEmMassa(ids) {
  const envelope = await http.post("/ativos/bulk-inativar", { ids });
  const { data } = unwrapPayload(envelope);
  if (data != null && typeof data === "object") {
    return data;
  }
  return { alterados: 0, solicitados: 0 };
}
