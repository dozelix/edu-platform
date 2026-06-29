import React, { useState } from 'react'

// ======================================================
// LoginRegister Component
// Login y registro contra la colección `usuarios` del Caso 3 (auth:*).
// Vocabulario del caso: nombre, tipo (estudiante | instructor).
// ======================================================

export function LoginRegister({ onSuccess }) {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  // Form state - Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Form state - Register
  const [registerNombre, setRegisterNombre] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [registerTipo, setRegisterTipo] = useState('estudiante')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!window.api) {
        setError('API no disponible')
        setLoading(false)
        return
      }

      const response = await window.api.invoke('auth:login', {
        email: loginEmail,
        password: loginPassword,
      })

      if (response.success) {
        setCurrentUser(response.data)
        setSuccess(`Bienvenido ${response.data.nombre}`)
        setLoginEmail('')
        setLoginPassword('')
        setTimeout(() => {
          onSuccess?.(response.data)
        }, 1200)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!window.api) {
        setError('API no disponible')
        setLoading(false)
        return
      }

      const response = await window.api.invoke('auth:register', {
        nombre: registerNombre,
        email: registerEmail,
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
        tipo: registerTipo,
      })

      if (response.success) {
        setSuccess(`Cuenta creada: ${response.data.nombre} (${response.data.tipo})`)
        setRegisterNombre('')
        setRegisterEmail('')
        setRegisterPassword('')
        setRegisterConfirmPassword('')
        setTimeout(() => {
          setMode('login')
          setSuccess('')
        }, 2000)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      if (window.api) {
        await window.api.invoke('auth:logout')
      }
      setCurrentUser(null)
      setSuccess('Sesión cerrada')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(`Error: ${err.message}`)
    }
  }

  // Si hay usuario autenticado, mostrar resumen
  if (currentUser) {
    return (
      <div className="auth-container auth-dashboard">
        <div className="auth-card">
          <h1>EduPlatform</h1>
          <div className="user-info">
            <p>
              <strong>Nombre:</strong> {currentUser.nombre}
            </p>
            <p>
              <strong>Email:</strong> {currentUser.email}
            </p>
            <p>
              <strong>Tipo:</strong>{' '}
              <span className={`role-badge role-${currentUser.tipo}`}>{currentUser.tipo}</span>
            </p>
          </div>
          <button className="btn btn-logout" onClick={handleLogout} disabled={loading}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>EduPlatform</h1>

        {/* Selector de modo */}
        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login')
              setError('')
              setSuccess('')
            }}
            disabled={loading}
          >
            Iniciar Sesión
          </button>
          <button
            className={`mode-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register')
              setError('')
              setSuccess('')
            }}
            disabled={loading}
          >
            Registrarse
          </button>
        </div>

        {/* Mensajes */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Formulario de Login */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="tu@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                placeholder="Contraseña"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Entrando...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {/* Formulario de Registro */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label htmlFor="register-nombre">Nombre Completo</label>
              <input
                id="register-nombre"
                type="text"
                placeholder="Tu nombre"
                value={registerNombre}
                onChange={(e) => setRegisterNombre(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                placeholder="tu@email.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Contraseña</label>
              <input
                id="register-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm">Confirmar Contraseña</label>
              <input
                id="register-confirm"
                type="password"
                placeholder="Repite tu contraseña"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-tipo">Tipo</label>
              <select
                id="register-tipo"
                value={registerTipo}
                onChange={(e) => setRegisterTipo(e.target.value)}
                disabled={loading}
              >
                <option value="estudiante">Estudiante</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>
        )}

        <p className="auth-footer">EduPlatform - Plataforma Educativa</p>
      </div>
    </div>
  )
}
