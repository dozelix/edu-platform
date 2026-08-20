import { useState, useEffect, useRef, FormEvent } from 'react'
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  ArrowRight,
  User,
} from 'lucide-react'

const FIELD_WRAP =
  'flex items-center gap-2 border bg-white px-3 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[var(--color-primary)] border-default focus-within:border-[var(--color-primary)]'
const FIELD = 'flex-1 text-sm text-body outline-none bg-transparent placeholder:text-subtle'
const FIELD_LABEL = 'text-sm font-semibold text-body'

interface UserData {
  id?: string
  nombre: string
  email: string
  tipo: string
}

interface LoginRegisterProps {
  onSuccess: (user: UserData) => void
  onCancel?: () => void
}

export function LoginRegister({ onSuccess, onCancel }: LoginRegisterProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const _timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => {
      for (const t of _timeouts.current) {
        try {
          clearTimeout(t)
        } catch {}
      }
      _timeouts.current = []
    }
  }, [])

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [regNombre, setRegNombre] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regTipo, setRegTipo] = useState('estudiante')

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
    setSuccess('')
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const win = globalThis.window as any
      if (!win?.api) {
        setError('API no disponible')
        return
      }
      const res = await win.api.invoke('auth:login', {
        email: loginEmail,
        password: loginPassword,
      })
      if (res.success) {
        setCurrentUser(res.data)
        setSuccess(`Bienvenido ${res.data.nombre}`)
        const id = setTimeout(() => onSuccess?.(res.data), 1000)
        _timeouts.current.push(id)
      } else {
        setError(res.error)
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const win = globalThis.window as any
      if (!win?.api) {
        setError('API no disponible')
        return
      }
      const res = await win.api.invoke('auth:register', {
        nombre: regNombre,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirm,
        tipo: regTipo,
      })
      if (res.success) {
        setSuccess(`Cuenta creada: ${res.data.nombre} (${res.data.tipo})`)
        setRegNombre('')
        setRegEmail('')
        setRegPassword('')
        setRegConfirm('')
        const id = setTimeout(() => {
          setMode('login')
          setSuccess('')
        }, 1800)
        _timeouts.current.push(id)
      } else {
        setError(res.error)
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (currentUser) {
    return (
      <main className="min-h-screen bg-body flex items-center justify-center px-4">
        <section className="bg-white border border-default shadow-lg p-10 max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto">
            <Check size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-body">Bienvenido de vuelta</h1>
          <p className="text-sm text-muted-color">
            Sesión iniciada como{' '}
            <strong className="text-body">{currentUser.nombre}</strong> ({currentUser.tipo}).
          </p>
        </section>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-body flex flex-col">
      <header className="bg-white border-b border-default px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={22} className="text-primary" />
          <span className="text-xl font-extrabold text-primary">EduPlatform</span>
        </div>
        <div className="flex items-center gap-5">
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-muted-color font-medium hover:text-body hover:underline cursor-pointer"
              type="button"
            >
              Volver al catálogo
            </button>
          )}
          <p className="text-sm text-muted-color">
            {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button onClick={switchMode} className="text-primary font-semibold hover:underline cursor-pointer" type="button">
              {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </header>

      <div className="flex flex-1">
        {mode === 'login' ? (
          <aside className="hidden lg:flex flex-col justify-between bg-[#1c1d1f] text-white p-10 w-[420px] flex-shrink-0">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-widest text-on-primary uppercase">
                Continúa aprendiendo
              </p>
              <h2 className="text-3xl font-extrabold leading-tight text-white">
                Tu próxima
                <br />
                habilidad te
                <br />
                <span className="text-on-primary">está esperando.</span>
              </h2>
              <p className="text-subtle text-sm leading-relaxed">
                Inicia sesión para retomar donde lo dejaste, ver tu progreso y acceder a tus cursos.
              </p>
            </div>

            <ul className="flex flex-col gap-4">
              {[
                'Retoma cada curso donde lo dejaste',
                'Sigue tu progreso lección a lección',
                'Comenta y aprende a tu propio ritmo',
              ].map((texto) => (
                <li key={texto} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Check size={16} className="text-on-primary" />
                  </span>
                  <span className="text-sm text-on-primary">{texto}</span>
                </li>
              ))}
            </ul>

            <div />
          </aside>
        ) : (
          <aside className="hidden lg:flex flex-col justify-between bg-primary text-white p-10 w-[420px] flex-shrink-0">
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold leading-tight text-white">
                Únete a<br />
                <span className="text-on-primary">EduPlatform</span>
              </h2>
              <p className="text-on-primary text-sm leading-relaxed">
                Accede a los cursos, sigue tu progreso y aprende a tu propio ritmo, desde cualquier
                dispositivo.
              </p>
            </div>

            <ul className="flex flex-col gap-4">
              {[
                { stat: 'Catálogo', label: 'cursos con instructores' },
                { stat: 'Progreso', label: 'siempre a la vista' },
                { stat: 'Comenta', label: 'lección a lección' },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Check size={18} className="text-on-primary" />
                  </span>
                  <span>
                    <span className="block text-base font-extrabold text-white">{item.stat}</span>
                    <span className="block text-on-primary text-xs">{item.label}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div />
          </aside>
        )}

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <section className="w-full max-w-md">
            <div className="bg-white border border-default shadow-sm p-8 flex flex-col gap-5">
              <header className="space-y-1">
                <h1 className="text-2xl font-extrabold text-body">
                  {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </h1>
                <p className="text-sm text-muted-color">
                  {mode === 'login'
                    ? 'Bienvenido de vuelta. Accede a tu cuenta.'
                    : 'Regístrate como estudiante o instructor.'}
                </p>
              </header>

              {error && (
                <div className="flex items-start gap-2.5 px-4 py-3 text-sm" style={{ background: '#fff3f3', border: '1px solid #fca5a5', color: 'var(--color-danger)' }}>
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2.5 px-4 py-3 text-sm" style={{ background: '#eafaf1', border: '1px solid #86e3b4', color: 'var(--color-success)' }}>
                  <Check size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="login-email" className={FIELD_LABEL}>
                      Correo electrónico
                    </label>
                    <div className={FIELD_WRAP}>
                      <Mail size={16} className="text-muted-color flex-shrink-0" />
                      <input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className={FIELD}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="login-password" className={FIELD_LABEL}>
                      Contraseña
                    </label>
                    <div className={FIELD_WRAP}>
                      <Lock size={16} className="text-muted-color flex-shrink-0" />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Tu contraseña"
                        className={FIELD}
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-muted-color hover:text-primary cursor-pointer"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <SubmitButton loading={loading} label="Iniciar sesión" />
                </form>
              ) : (
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reg-nombre" className={FIELD_LABEL}>
                      Nombre completo
                    </label>
                    <div className={FIELD_WRAP}>
                      <User size={16} className="text-muted-color flex-shrink-0" />
                      <input
                        id="reg-nombre"
                        type="text"
                        value={regNombre}
                        onChange={(e) => setRegNombre(e.target.value)}
                        placeholder="Tu nombre"
                        className={FIELD}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reg-email" className={FIELD_LABEL}>
                      Correo electrónico
                    </label>
                    <div className={FIELD_WRAP}>
                      <Mail size={16} className="text-muted-color flex-shrink-0" />
                      <input
                        id="reg-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className={FIELD}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reg-pass" className={FIELD_LABEL}>
                        Contraseña
                      </label>
                      <div className={FIELD_WRAP}>
                        <Lock size={16} className="text-muted-color flex-shrink-0" />
                        <input
                          id="reg-pass"
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min. 6"
                          className={FIELD}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="reg-confirm" className={FIELD_LABEL}>
                        Confirmar
                      </label>
                      <div className={FIELD_WRAP}>
                        <Lock size={16} className="text-muted-color flex-shrink-0" />
                        <input
                          id="reg-confirm"
                          type="password"
                          value={regConfirm}
                          onChange={(e) => setRegConfirm(e.target.value)}
                          placeholder="Repite"
                          className={FIELD}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reg-tipo" className={FIELD_LABEL}>
                      Tipo de cuenta
                    </label>
                    <select
                      id="reg-tipo"
                      value={regTipo}
                      onChange={(e) => setRegTipo(e.target.value)}
                      disabled={loading}
                      className="border border-default bg-white px-3 py-2.5 text-sm text-body outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="estudiante">Estudiante</option>
                      <option value="instructor">Instructor</option>
                    </select>
                  </div>

                  <SubmitButton loading={loading} label="Crear cuenta" />
                </form>
              )}
            </div>

            <footer className="text-center text-xs text-subtle mt-5">
              EduPlatform · Plataforma Educativa
            </footer>
          </section>
        </main>
      </div>
    </div>
  )
}

interface SubmitButtonProps {
  loading: boolean
  label: string
}

function SubmitButton({ loading, label }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold py-3 text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          {label}
          <ArrowRight size={16} />
        </>
      )}
    </button>
  )
}
