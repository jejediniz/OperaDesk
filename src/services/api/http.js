const DEFAULT_TIMEOUT_MS = 10_000

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

class HttpError extends Error {
  constructor(message, { status = null, details = null } = {}) {
    const safe =
      message === undefined || message === null || message === ""
        ? "Erro inesperado"
        : typeof message === "string"
          ? message
          : String(message)
    super(safe)
    this.name = "HttpError"
    this.status = status
    this.details = details
  }
}

function buildUrl(path, params) {
  const base = path.startsWith("/api") ? path : `/api${path.startsWith("/") ? path : `/${path}`}`
  if (!params) return base

  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    search.append(key, String(value))
  }
  const query = search.toString()
  return query ? `${base}?${query}` : base
}

async function parseJsonSafe(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function request(path, { method = "GET", body, params, signal, headers = {}, timeout = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  const timer = timeout
    ? setTimeout(() => controller.abort(new Error("timeout")), timeout)
    : null

  const externalAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener("abort", externalAbort, { once: true })
  }

  try {
    const response = await fetch(buildUrl(path, params), {
      method,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    })

    const data = await parseJsonSafe(response)

    if (!response.ok) {
      if (response.status === 401 && typeof unauthorizedHandler === "function") {
        unauthorizedHandler()
      }
      const message =
        data?.error?.message ||
        data?.message ||
        `Erro ${response.status ?? "desconhecido"}`
      throw new HttpError(message, {
        status: response.status,
        details: data?.error?.details || null
      })
    }

    const methodUpper = method.toUpperCase()
    const mutates = ["POST", "PUT", "PATCH", "DELETE"].includes(methodUpper)
    if (mutates && response.status !== 204 && (data === null || data === undefined)) {
      throw new HttpError(
        "Resposta vazia ou JSON inválido do servidor. Tente de novo.",
        {
          status: response.status ?? 0,
          details: null
        }
      )
    }

    return data
  } catch (error) {
    if (error instanceof HttpError) throw error
    if (error?.name === "AbortError") {
      throw new HttpError("Tempo de resposta excedido", { status: 0 })
    }
    throw new HttpError(error?.message || "Erro inesperado", { status: 0 })
  } finally {
    if (timer) clearTimeout(timer)
    if (signal) signal.removeEventListener?.("abort", externalAbort)
  }
}

const http = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" })
}

export { HttpError }
export default http
