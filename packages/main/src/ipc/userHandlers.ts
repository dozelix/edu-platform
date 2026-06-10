import { ipcMain } from 'electron'
import { User } from '../db/models/User'

// ======================================================
// IPC User Handlers
// Operaciones CRUD para usuarios vía Electron IPC
// Canales: user:get-all | user:get-by-id | user:create | user:update | user:delete
// ======================================================

type IpcResponse<T = unknown> = { success: true; data: T } | { success: false; error: string }

// GET all users
ipcMain.handle('user:get-all', async (): Promise<IpcResponse> => {
  try {
    const users = await User.find().lean()
    return { success: true, data: users }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// GET user by ID
ipcMain.handle('user:get-by-id', async (_, id: string): Promise<IpcResponse> => {
  try {
    const user = await User.findById(id).lean()
    if (!user) return { success: false, error: 'Usuario no encontrado' }
    return { success: true, data: user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// CREATE user
ipcMain.handle('user:create', async (_, userData: any): Promise<IpcResponse> => {
  try {
    const user = new User(userData)
    const saved = await user.save()
    return { success: true, data: saved.toObject() }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// UPDATE user
ipcMain.handle('user:update', async (_, id: string, userData: any): Promise<IpcResponse> => {
  try {
    const updated = await User.findByIdAndUpdate(id, userData, { new: true }).lean()
    if (!updated) return { success: false, error: 'Usuario no encontrado' }
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// DELETE user
ipcMain.handle('user:delete', async (_, id: string): Promise<IpcResponse> => {
  try {
    const deleted = await User.findByIdAndDelete(id).lean()
    if (!deleted) return { success: false, error: 'Usuario no encontrado' }
    return { success: true, data: { id } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
