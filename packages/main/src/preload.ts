import { contextBridge, ipcRenderer } from 'electron'

// ======================================================
// Preload Script — IPC Bridge
// Expone de forma segura el canal IPC al frontend (React)
// contextIsolation = true protege el frontend de Node.js
// ======================================================

contextBridge.exposeInMainWorld('api', {
  /**
   * Llama a un handler IPC en el proceso main y devuelve la respuesta.
   * Uso: window.api.invoke('user:get-all')
   */
  invoke: (channel: string, ...args: unknown[]) => {
    const allowedChannels = [
      // Auth channels
      'auth:register',
      'auth:login',
      'auth:logout',
      'auth:get-current',
      // User channels
      'user:get-all',
      'user:get-by-id',
      'user:create',
      'user:update',
      'user:delete',
      // DB status
      'db:status',
    ]
    if (!allowedChannels.includes(channel)) {
      return Promise.reject(new Error(`Canal IPC no permitido: ${channel}`))
    }
    return ipcRenderer.invoke(channel, ...args)
  },

  /**
   * Suscribe a eventos emitidos desde el proceso main.
   * Devuelve una función para cancelar la suscripción (cleanup).
   */
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.on(channel, handler)
    // Retorna función de cleanup
    return () => ipcRenderer.removeListener(channel, handler)
  },
})
