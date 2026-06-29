import { ipcMain } from 'electron'
import { User } from '../db/models/User.js'

// ======================================================
// IPC User Handlers
// Operaciones CRUD sobre la colección `users` (modelo User legacy).
// La autenticación del Caso 3 (auth:*) vive en authHandlers.js y usa `usuarios`.
// Canales: user:*
// ======================================================

// ======================================================
// CRUD HANDLERS
// ======================================================

// GET all users
ipcMain.handle('user:get-all', async () => {
  try {
    const users = await User.find().lean()
    return { success: true, data: users }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// GET user by ID
ipcMain.handle('user:get-by-id', async (_, id) => {
  try {
    const user = await User.findById(id).lean()
    if (!user) return { success: false, error: 'Usuario no encontrado' }
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// CREATE user
ipcMain.handle('user:create', async (_, userData) => {
  try {
    const user = new User(userData)
    const saved = await user.save()
    return { success: true, data: saved.toObject() }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// UPDATE user
ipcMain.handle('user:update', async (_, id, userData) => {
  try {
    const updated = await User.findByIdAndUpdate(id, userData, { new: true }).lean()
    if (!updated) return { success: false, error: 'Usuario no encontrado' }
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// DELETE user
ipcMain.handle('user:delete', async (_, id) => {
  try {
    const deleted = await User.findByIdAndDelete(id).lean()
    if (!deleted) return { success: false, error: 'Usuario no encontrado' }
    return { success: true, data: { id } }
  } catch (error) {
    return { success: false, error: error.message }
  }
})
