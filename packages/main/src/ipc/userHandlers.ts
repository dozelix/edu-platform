import { ipcMain } from 'electron'
import { User } from '../db/models/User'

// ======================================================
// IPC User Handlers
// Operaciones CRUD para usuarios vía Electron IPC
// Incluye autenticación (login/register)
// Canales: user:*, auth:*
// ======================================================

type IpcResponse<T = unknown> = { success: true; data: T } | { success: false; error: string }

// ======================================================
// AUTHENTICATION HANDLERS
// ======================================================

// REGISTER
ipcMain.handle('auth:register', async (_, registerData: any): Promise<IpcResponse> => {
  try {
    const { name, email, password, confirmPassword, role = 'student' } = registerData

    // Validaciones básicas
    if (!name || !email || !password) {
      return { success: false, error: 'Todos los campos son requeridos' }
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Las contraseñas no coinciden' }
    }

    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Email inválido' }
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return { success: false, error: 'El email ya está registrado' }
    }

    // Crear nuevo usuario
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
    })

    const saved = await user.save()
    const userObj = saved.toObject()
    const { password: _, ...userWithoutPassword } = userObj

    return { success: true, data: userWithoutPassword }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error en el registro' }
  }
})

// LOGIN
ipcMain.handle('auth:login', async (_, loginData: any): Promise<IpcResponse> => {
  try {
    const { email, password } = loginData

    if (!email || !password) {
      return { success: false, error: 'Email y contraseña requeridos' }
    }

    // Buscar usuario (incluir password para comparar)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return { success: false, error: 'Email o contraseña incorrectos' }
    }

    // Comparar contraseña
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return { success: false, error: 'Email o contraseña incorrectos' }
    }

    const userObj = user.toObject()
    const { password: _, ...userWithoutPassword } = userObj

    return { success: true, data: userWithoutPassword }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error en el login' }
  }
})

// LOGOUT (simplemente mensaje de confirmación)
ipcMain.handle('auth:logout', async (): Promise<IpcResponse> => {
  return { success: true, data: { message: 'Sesión cerrada' } }
})

// ======================================================
// CRUD HANDLERS (existentes, sin cambios mayores)
// ======================================================

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
