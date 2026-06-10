// ======================================================
// SHARED — Response wrapper
// Envuelve respuestas IPC con status, data y error
// ======================================================

export interface IpcResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export function ipcSuccess<T>(data: T): IpcResponse<T> {
  return { success: true, data }
}

export function ipcError(error: string): IpcResponse {
  return { success: false, error }
}
