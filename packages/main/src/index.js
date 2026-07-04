import { app, BrowserWindow, dialog, session } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB, disconnectDB } from './db/connection.js'
import * as dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Si el proceso padre cierra la tuberia de stdout/stderr (p. ej. al terminar el
// arnes de dev), escribir un log lanza EPIPE. Sin este guard esa escritura durante
// el cierre tumba el proceso main con una excepcion no capturada y su dialogo.
process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') process.exit(0)
})
process.stderr.on('error', () => {})

// 🛠️ Issue #14: Reemplazar rutas relativas fijas (../../../) por resolución dinámica basada en la raíz
// app.getAppPath() apunta de forma consistente a la raíz donde reside el package.json de ejecución principal.
const rootPath = app.getAppPath()
dotenv.config({ path: path.join(rootPath, '.env.local') })
dotenv.config({ path: path.join(rootPath, '.env') })

let mainWindow = null

// 🛠️ Issue #16: Validación robusta y segura por defecto (fail-safe)
// Asume siempre producción a menos que se declare explícitamente lo contrario.
const isDev = process.env.NODE_ENV === 'development'

// Aplica una Content-Security-Policy a las respuestas de la sesion. En dev se relaja
// (inline/eval y ws) para no romper el HMR de Vite; en prod queda estricta y solo
// habilita los origenes que la app usa: Google Fonts, imagenes de Unsplash y la API
// de tipos de cambio.
function aplicarCSP() {
  const script = isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self'"
  // El player embebido de YouTube descarga el video por fetch desde *.googlevideo.com y
  // toma sus iconos de gstatic; sin estos origenes en connect-src el video queda cargando.
  const ytData = 'https://*.googlevideo.com https://www.gstatic.com https://fonts.gstatic.com'
  const connect = isDev
    ? `connect-src 'self' https://open.er-api.com ${ytData} ws://localhost:5173 http://localhost:5173`
    : `connect-src 'self' https://open.er-api.com ${ytData}`
  const csp = [
    "default-src 'self'",
    script,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // Se permiten los CDN de imagenes propios de YouTube (miniatura/avatar/iconos del player
    // embebido). NO se habilitan doubleclick/googleads: esos son anuncios y se dejan bloqueados.
    'img-src ' +
      "'self' data: https://images.unsplash.com https://i.ytimg.com https://yt3.ggpht.com " +
      'https://www.gstatic.com https://fonts.gstatic.com',
    // El player de YouTube reproduce vía MediaSource con URLs blob:; hay que permitir blob:
    // ademas de las fuentes https externas del video de la leccion.
    "media-src 'self' https: blob:",
    // El video de la leccion se incrusta por iframe de YouTube (dominio nocookie).
    "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
    connect,
  ].join('; ')

  // 🛠️ Issue #15: Se limpian los posibles listeners previos antes de registrar uno nuevo
  session.defaultSession.webRequest.onHeadersReceived(null)

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [csp] },
    })
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'), // Inyecta el puente IPC seguro window.api
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // En desarrollo carga el dev server de Vite (localhost:5173); en producción, usa
  // el bundle local generado por Vite.
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../frontend/dist/index.html'))
  }

  mainWindow.webContents.setUserAgent(app.userAgentFallback)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', async () => {
  // YouTube rechaza reproducir el video embebido si detecta "Electron" en el User-Agent
  // (lo trata como navegador no soportado). Reescribimos el UA a una variante Chrome.
  const sanitizedUA = (app.userAgentFallback || '')
    .replace(/ Electron\/[\d.]+/, '')
    .replace(/Electron\/[\d.]+/, '')
    .trim()

  app.userAgentFallback = sanitizedUA ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  aplicarCSP()
  const dbConnected = await connectDB()
  if (!dbConnected) {
    dialog.showErrorBox('Error de inicio', 'No se pudo conectar a MongoDB. La aplicación se cerrará.')
    app.quit()
    return
  }

  // Carga dinámica de handlers IPC nativos antes de mostrar la ventana.
  // Evita la condición de carrera en que el renderer llama IPC antes de que los
  // canales estén registrados.
  await import('./ipc/authHandlers.js')
  await import('./ipc/courseHandlers.js')
  await import('./ipc/learningHandlers.js')
  await import('./ipc/lessonHandlers.js')
  await import('./ipc/instructorHandlers.js')
  await import('./ipc/dbHandlers.js')

  createWindow()
})

app.on('window-all-closed', async () => {
  await disconnectDB()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})