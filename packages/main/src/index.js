import { app, BrowserWindow, session } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB, disconnectDB } from './db/connection.js'
import * as dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment variables from workspace root
dotenv.config({ path: path.join(__dirname, '../../../.env.local') })
dotenv.config({ path: path.join(__dirname, '../../../.env') })

let mainWindow = null
const isDev = process.env.NODE_ENV !== 'production'

// Aplica una Content-Security-Policy a las respuestas de la sesion. En dev se relaja
// (inline/eval y ws) para no romper el HMR de Vite; en prod queda estricta y solo
// habilita los origenes que la app usa: Google Fonts, imagenes de Unsplash y la API
// de tipos de cambio.
function aplicarCSP() {
  const script = isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self'"
  const connect = isDev
    ? "connect-src 'self' https://open.er-api.com ws://localhost:5173 http://localhost:5173"
    : "connect-src 'self' https://open.er-api.com"
  const csp = [
    "default-src 'self'",
    script,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://images.unsplash.com",
    // Los videos de leccion son externos (video_url); se permiten fuentes https.
    "media-src 'self' https:",
    connect,
  ].join('; ')

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
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'), // Inyecta el puente IPC seguro window.api
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // En desarrollo carga el dev server de Vite (localhost:5173); en produccion, el
  // bundle publicado en GitHub Pages.
  const url = isDev
    ? 'http://localhost:5173'
    : 'https://dozelix.github.io/EduPlataform/'

  mainWindow.loadURL(url)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', async () => {
  aplicarCSP()
  // Si la BD falla, connectDB no aborta: la ventana se abre y las vistas avisan del error.
  await connectDB()
  createWindow()

  // Carga dinámica de handlers IPC nativos
  await import('./ipc/authHandlers.js')
  await import('./ipc/courseHandlers.js')
  await import('./ipc/learningHandlers.js')
  await import('./ipc/lessonHandlers.js')
  await import('./ipc/instructorHandlers.js')
  await import('./ipc/dbHandlers.js')
})

app.on('window-all-closed', async () => {
  await disconnectDB()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})