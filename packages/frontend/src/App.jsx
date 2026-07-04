import { useState, useEffect } from 'react' // 👈 Quitamos 'React' por el issue #27

import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Catalog from './features/courses/Catalog'
import MyLearning from './features/learning/MyLearning'
import Lesson from './features/lesson/Lesson'
import InstructorDashboard from './features/instructor/InstructorDashboard'
import { LoginRegister } from './components/LoginRegister'

// 👈 DECLARACIÓN FUERA DEL COMPONENTE: 
// Se evalúa una sola vez al cargar el archivo, liberando al componente de esta carga.
const isElectron = typeof globalThis.window !== 'undefined' && !!globalThis.window.api;

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const isAuthenticated = !!currentUser

  const [dbStatus, setDbStatus] = useState('idle')
  const [activeNav, setActiveNav] = useState('courses')
  const [activeLeccionId, setActiveLeccionId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [showLogin, setShowLogin] = useState(false)
  const [pendingCourseId, setPendingCourseId] = useState(null)

  // ❌ Se eliminó el useState de isElectron que estaba aquí

  // Estado real de la BD (no decorativo): consulta db:estado al proceso main.
  useEffect(() => {
    if (!isElectron) return
    let activo = true
    globalThis.window.api
      .invoke('db:estado')
      .then((res) => {
        if (activo) setDbStatus(res?.data?.conectado ? 'connected' : 'error')
      })
      .catch(() => {
        if (activo) setDbStatus('error')
      })
    return () => {
      activo = false
    }
  }, []) // 👈 Ahora puedes dejar el array de dependencias vacío [], ya que isElectron es una constante externa

  // Abre el login recordando (opcional) el curso que el usuario intentaba inscribir.
  const requireLogin = (cursoId = null) => {
    setPendingCourseId(cursoId)
    setShowLogin(true)
    setSidebarOpen(false)
  }

  // Inscribe al usuario en un curso; no bloquea el post-login si ya estaba inscrito o falla.
  const enrollCourse = async (cursoId) => {
    if (!globalThis.window?.api) return
    try {
      await globalThis.window.api.invoke('inscripcion:crear', { cursoId })
    } catch {
      // Un fallo de inscripcion no debe impedir que el usuario entre a la app.
    }
  }

  // Tras un login/registro exitoso
  const handleLoginSuccess = async (user) => {
    setCurrentUser(user)
    setShowLogin(false)
    if (pendingCourseId) {
      await enrollCourse(pendingCourseId)
      setPendingCourseId(null)
    }
    setActiveNav('learning')
  }

  // Cierra la sesion y devuelve la app al catalogo publico.
  const handleLogout = async () => {
    try {
      await globalThis.window?.api?.invoke('auth:logout')
    } catch {
      // Un fallo al notificar el logout no debe bloquear el cierre en el renderer.
    }
    setCurrentUser(null)
    setActiveNav('courses')
    setActiveLeccionId(null)
    setSidebarOpen(false)
  }

  // ── Pantalla de login ──
  if (showLogin) {
    return (
      <LoginRegister
        onSuccess={handleLoginSuccess}
        onCancel={() => {
          setShowLogin(false)
          setPendingCourseId(null)
        }}
      />
    )
  }

  // Los instructores tienen su propio panel
  if (isAuthenticated && currentUser.tipo === 'instructor') {
    return <InstructorDashboard user={currentUser} onLogout={handleLogout} />
  }

  const appUser = currentUser
    ? {
        name: currentUser.nombre,
        initials: currentUser.nombre
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      }
    : null

  const handleNav = (id) => {
    if (!isAuthenticated && (id === 'learning' || id === 'lesson')) {
      requireLogin()
      return
    }
    setActiveNav(id)
    setSidebarOpen(false)
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'courses':
        return <Catalog user={currentUser} onRequireLogin={requireLogin} />
      case 'learning':
        return (
          <MyLearning
            user={currentUser}
            onContinue={(leccionId) => {
              setActiveLeccionId(leccionId)
              setActiveNav('lesson')
            }}
          />
        )
      case 'lesson':
        return (
          <Lesson
            leccionId={activeLeccionId}
            user={currentUser}
            onNavigate={(leccionId) => setActiveLeccionId(leccionId)}
            onBack={() => setActiveNav('learning')}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="db-layout">
      <Sidebar
        activeNav={activeNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleNav={handleNav}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        dbStatus={dbStatus}
      />
      <div className="db-main">
        <Topbar
          user={appUser}
          isAuthenticated={isAuthenticated}
          onLogin={() => requireLogin()}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="db-content" id="main">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App