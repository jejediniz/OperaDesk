import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true
})

let unauthorizedHandler = null

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

function normalizeError(error) {
  const status = error.response?.status
  const message =
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message ||
    'Erro inesperado'

  const normalized = new Error(message)
  normalized.status = status
  normalized.details = error.response?.data?.error?.details || null
  return normalized
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof unauthorizedHandler === 'function') {
      unauthorizedHandler()
    }

    return Promise.reject(normalizeError(error))
  }
)

export default api
