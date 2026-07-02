const { contextBridge, ipcRenderer } = require('electron')

// Whitelist de canales IPC invocables desde el renderer. Un renderer comprometido
// solo puede llamar estos canales conocidos; cualquier otro se rechaza. Mantener
// sincronizada con los ipcMain.handle de packages/main/src/ipc/.
const CANALES = new Set([
  'auth:login',
  'auth:register',
  'auth:logout',
  'curso:listar',
  'inscripcion:crear',
  'aprendizaje:listar',
  'leccion:obtener',
  'leccion:completar',
  'comentario:listar',
  'comentario:crear',
  'instructor:resumen',
  'db:estado',
])

contextBridge.exposeInMainWorld('api', {
  invoke: (channel, ...args) => {
    if (!CANALES.has(channel)) {
      return Promise.reject(new Error('Canal IPC no permitido: ' + channel))
    }
    return ipcRenderer.invoke(channel, ...args)
  },
})
