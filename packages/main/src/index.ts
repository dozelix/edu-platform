import { app, BrowserWindow, dialog, session } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.stdout.on('error', (err: any) => {
  if (err.code === 'EPIPE') process.exit(0)
})
process.stderr.on('error', () => {})

const isDev = process.env.NODE_ENV === 'development'

const envPath = isDev 
  ? path.join(process.cwd(), '.env.local') 
  : path.join(app.getAppPath(), '.env.local')

dotenv.config({ path: envPath })

let mainWindow: BrowserWindow | null = null

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

  session.defaultSession.webRequest.onHeadersReceived((details: any, callback: any) => {
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

let disconnectDatabaseFn: (() => Promise<void>) | null = null

app.on('ready', async () => {
  const sanitizedUA = (app.userAgentFallback || '')
    .replace(/ Electron\/[\d.]+/, '')
    .replace(/Electron\/[\d.]+/, '')
    .trim()

  app.userAgentFallback = sanitizedUA ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  aplicarCSP()

  const { connectDB, disconnectDB } = await import('./db/connection.js')
  disconnectDatabaseFn = disconnectDB

  const dbConnected = await connectDB()
  if (!dbConnected) {
    dialog.showErrorBox('Error de inicio', 'No se pudo conectar a MongoDB. La aplicación se cerrará.')
    app.quit()
    return
  }

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
