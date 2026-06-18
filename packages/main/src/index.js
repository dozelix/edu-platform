import { app, BrowserWindow } from 'electron'
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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const url = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../../frontend/dist/index.html')}`

  mainWindow.loadURL(url)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', async () => {
  await connectDB()
  createWindow()

  // Dynamic loading of IPC modules
  await import('./ipc/userHandlers.js')
})

app.on('window-all-closed', async () => {
  await disconnectDB()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
