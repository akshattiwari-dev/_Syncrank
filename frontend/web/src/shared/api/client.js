export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export class ApiError extends Error {
  constructor(message, code, status, details) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // send the httpOnly session cookie
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  // CSV export and other non-JSON responses bypass the JSON parsing path.
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    if (!res.ok) {
      throw new ApiError(`Request failed with status ${res.status}`, 'REQUEST_FAILED', res.status)
    }
    return res
  }

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(
      body?.error ?? 'Something went wrong',
      body?.code ?? 'UNKNOWN_ERROR',
      res.status,
      body?.details,
    )
  }

  return body
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),

  post: (path, data, options = {}) =>
    request(path, {
      method: 'POST',
      body: data != null ? JSON.stringify(data) : undefined,
      headers: options.headers || {},
    }),

  patch: (path, data, options = {}) =>
    request(path, {
      method: 'PATCH',
      body: data != null ? JSON.stringify(data) : undefined,
      headers: options.headers || {},
    }),

  delete: (path) => request(path, { method: 'DELETE' }),

  /** Returns the raw Response — for CSV download / blob handling. */
  raw: (path) => request(path, { method: 'GET' }),
}