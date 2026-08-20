import { ipcMain } from 'electron'
import mongoose from 'mongoose'

ipcMain.handle('db:estado', async () => {
  return { success: true, data: { conectado: mongoose.connection.readyState === 1 } }
}
)
