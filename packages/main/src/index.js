import { app, BrowserWindow, dialog, session } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Si el proceso padre cierra la tuberia de stdout/stderr (p. ej. al terminar el
// arnes de dev), escribir un log lanza EPIPE. Sin este guard esa escritura durante
// el cierre tumba el proceso main con una excepcion no capturada y su dialogo.
process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') process.exit(0)
})
process.stderr.on('error', () => {})

// 🛠️ Issue #14: Resolución dinámica de entornos ultra-limpia basada en CWD (desarrollo) y AppPath (producción)
const isDev = process.env.NODE_ENV === 'development'

// ⚡ FIX: Usar process.cwd() en desarrollo apunta directo a la raíz del monorrepo sin importar el comportamiento de Electron
const envPath = isDev 
  ? path.join(process.cwd(), '.env.local') 
  : path.join(app.getAppPath(), '.env.local')

dotenv.config({ path: envPath })

let mainWindow = null

// Aplica una Content-Security-Policy a las respuestas de la sesion. En dev se relaja
// (inline/eval y ws) para no romper el HMR de Vite; en prod queda estricta y solo
// habilita los origenes que la app usa: Google Fonts, imagenes de Unsplash y la API
// de tipos de cambio.
function aplicarCSP() {
  const script = isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self'"
  const ytData = 'https://*.googlevideo.com https://www.gstatic.com https://fonts.gstatic.com'
  const connect = isDev
    ? `connect-src 'self' https://open.er-api.com ${ytData} ws://localhost:5173 http://localhost:5173`
    : `connect-src 'self' https://open.er-api.com ${ytData}`
  const csp = [
    "default-src 'self'",
    script,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    'img-src ' +
      "'self' data: https://images.unsplash.com https://i.ytimg.com https://yt3.ggpht.com " +
      'https://www.gstatic.com https://fonts.gstatic.com',
    "media-src 'self' https: blob:",
    "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
    connect,
  ].join('; ')

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
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

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

// Global reference to disconnectDB for the lifecycle events
let disconnectDatabaseFn = null

app.on('ready', async () => {
  const sanitizedUA = (app.userAgentFallback || '')
    .replace(/ Electron\/[\d.]+/, '')
    .replace(/Electron\/[\d.]+/, '')
    .trim()

  app.userAgentFallback = sanitizedUA ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  aplicarCSP()

  // ⚡ FIX: Carga diferida y dinámica de la DB una vez que dotenv está inicializado de forma garantizada
  const { connectDB, disconnectDB } = await import('./db/connection.js')
  disconnectDatabaseFn = disconnectDB

  const dbConnected = await connectDB()
  if (!dbConnected) {
    dialog.showErrorBox('Error de inicio', 'No se pudo conectar a MongoDB. La aplicación se cerrará.')
    app.quit()
    return
  }

  // Carga dinámica de handlers IPC nativos
  await import('./ipc/authHandlers.js')
  await import('./ipc/courseHandlers.js')
  await import('./ipc/learningHandlers.js')
  await import('./ipc/lessonHandlers.js')
  await import('./ipc/instructorHandlers.js')
  await import('./ipc/dbHandlers.js')

  createWindow()
})

app.on('window-all-closed', async () => {
  if (disconnectDatabaseFn) {
    await disconnectDatabaseFn()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})