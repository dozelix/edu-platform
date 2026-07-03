import { ipcMain } from 'electron'
import { Usuario } from '../db/models/Usuario.js'
import { setUsuario, limpiarSesion } from '../session.js'

// ======================================================
// IPC Auth Handlers (Caso 3)
// Autentica contra la colección `usuarios` (estudiantes e instructores).
// Mantiene bcrypt; devuelve el usuario con vocabulario del caso: nombre, tipo.
// Canales: auth:login, auth:register, auth:logout
// ======================================================

function publico(usuario) {
  return {
    id: usuario._id.toString(),
    nombre: usuario.nombre,
    email: usuario.email,
    tipo: usuario.tipo,
  }
}

// Normaliza credenciales para que login y registro coincidan: el email es
// insensible a mayusculas y a espacios de borde (como se guarda), y la contraseña
// se recorta en los extremos para que un espacio accidental (copiar/pegar,
// autocompletar) no impida entrar. Los espacios internos de la contraseña se
// respetan; solo se quitan los de los extremos.
function normalizarEmail(v) {
  return typeof v === 'string' ? v.trim().toLowerCase() : ''
}
function normalizarPassword(v) {
  return typeof v === 'string' ? v.trim() : ''
}

ipcMain.handle('auth:login', async (_, { email, password } = {}) => {
  try {
    const emailNorm = normalizarEmail(email)
    const passNorm = normalizarPassword(password)
    if (!emailNorm || !passNorm) {
      return { success: false, error: 'Email y contraseña requeridos' }
    }
    const usuario = await Usuario.findOne({ email: emailNorm }).select('+password')
    if (!usuario || !usuario.password) {
      return { success: false, error: 'Email o contraseña incorrectos' }
    }
    const valido = await usuario.comparePassword(passNorm)
    if (!valido) {
      return { success: false, error: 'Email o contraseña incorrectos' }
    }
    const datos = publico(usuario)
    setUsuario(datos)
    return { success: true, data: datos }
  } catch (error) {
    return { success: false, error: error.message || 'Error en el login' }
  }
})

ipcMain.handle('auth:register', async (_, data = {}) => {
  try {
    const { nombre, email, password, confirmPassword, tipo = 'estudiante' } = data

    // Misma normalizacion que auth:login para que el registro y el acceso coincidan.
    const nombreNorm = typeof nombre === 'string' ? nombre.trim() : ''
    const emailNorm = normalizarEmail(email)
    const passNorm = normalizarPassword(password)
    const confirmNorm = normalizarPassword(confirmPassword)

    if (!nombreNorm || !emailNorm || !passNorm) {
      return { success: false, error: 'Todos los campos son requeridos' }
    }
    if (passNorm !== confirmNorm) {
      return { success: false, error: 'Las contraseñas no coinciden' }
    }
    if (passNorm.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailNorm)) {
      return { success: false, error: 'Email inválido' }
    }

    const existe = await Usuario.findOne({ email: emailNorm })
    if (existe) {
      return { success: false, error: 'El email ya está registrado' }
    }

    const usuario = await Usuario.create({
      nombre: nombreNorm,
      email: emailNorm,
      password: passNorm,
      tipo: tipo === 'instructor' ? 'instructor' : 'estudiante',
    })

    const datos = publico(usuario)
    setUsuario(datos)
    return { success: true, data: datos }
  } catch (error) {
    return { success: false, error: error.message || 'Error en el registro' }
  }
})

ipcMain.handle('auth:logout', async () => {
  limpiarSesion()
  return { success: true, data: { message: 'Sesión cerrada' } }
})
