declare class AppError extends Error {
  statusCode: number
  details: unknown | null
  constructor(message: string, statusCode?: number, details?: unknown | null)
}

export = AppError
