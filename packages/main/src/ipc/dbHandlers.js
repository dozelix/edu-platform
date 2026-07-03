import { ipcMain } from 'electron'
import mongoose from 'mongoose'

// Estado real de la conexion a MongoDB para el indicador del sidebar.
// readyState === 1 significa conectado; cualquier otro valor es no conectado.
ipcMain.handle('db:estado', async () => {
  return { success: true, data: { conectado: mongoose.connection.readyState === 1 } }
})
