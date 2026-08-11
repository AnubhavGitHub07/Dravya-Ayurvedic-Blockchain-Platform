import { Response } from 'express'

// ─── Standard API Response Format ────────────────────────

interface SuccessResponse {
  success: true
  message: string
  data?: unknown
}

interface ErrorResponse {
  success: false
  message: string
  errors?: any
}

export function sendSuccess(
  res: Response,
  message: string,
  data?: unknown,
  statusCode: number = 200
): void {
  const response: SuccessResponse = { success: true, message }
  if (data !== undefined) {
    response.data = data
  }
  res.status(statusCode).json(response)
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  errors?: any
): void {
  const response: ErrorResponse = { success: false, message }
  if (errors) {
    response.errors = errors
  }
  res.status(statusCode).json(response)
}
