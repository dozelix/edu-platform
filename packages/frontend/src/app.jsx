import React, { useState, useEffect } from 'react'

import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Catalog from './features/courses/Catalog'
import MyLearning from './features/learning/MyLearning'
import Lesson from './features/lesson/Lesson'
import InstructorDashboard from './features/instructor/InstructorDashboard'
import { LoginRegister } from './components/LoginRegister'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const isAuthenticated = !!currentUser

  const [dbStatus, setDbStatus] = useState('idle')
  const [activeNav, setActiveNav] = useState('courses')
  const [activeLeccionId, setActiveLeccionId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Flujo de inscripcion sin sesion (issue #21): al intentar inscribirse deslogueado
  // se recuerda el curso y se pide login; tras entrar se inscribe y se va a Mi Aprendizaje.
  const [showLogin, setShowLogin] = useState(false)
  const [pendingCourseId, setPendingCourseId] = useState(null)

  const [isElectron] = useState(
    () => typeof globalThis.window !== 'undefined' && !!globalThis.window.api
  )

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
  }, [isElectron])

  // Abre el login recordando (opcional) el curso que el usuario intentaba inscribir.
  const requireLogin = (cursoId = null) => {
    setPendingCourseId(cursoId)
    setShowLogin(true)
    setSidebarOpen(false)
  }

  // Inscribe al usuario en un curso; no bloquea el post-login si ya estaba inscrito o falla.
  // El usuario a inscribir lo determina la sesion del proceso main, no el renderer.
  const enrollCourse = async (cursoId) => {
    if (!globalThis.window?.api) return
    try {
      await globalThis.window.api.invoke('inscripcion:crear', { cursoId })
    } catch {
      // Un fallo de inscripcion no debe impedir que el usuario entre a la app.
    }
  }

  // Tras un login/registro exitoso: si habia un curso pendiente lo inscribe y lleva
  // al usuario a la seccion de aprendizaje del curso.
  const handleLoginSuccess = async (user) => {
    setCurrentUser(user)
    setShowLogin(false)
    if (pendingCourseId) {
      await enrollCourse(pendingCourseId)
      setPendingCourseId(null)
    }
    setActiveNav('learning')
  }

  // Cierra la sesion y devuelve la app al catalogo publico. Limpia tambien la
  // sesion del proceso main (auth:logout): si no, el main seguiria autenticado y
  // los handlers que usan la sesion (p. ej. curso:listar) filtrarian datos del
  // usuario anterior al siguiente que use la app.
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

  // ── Pantalla de login (inscripcion sin sesion o "Iniciar sesion") ──
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

  // Los instructores tienen su propio panel: ven sus cursos, estudiantes y progreso.
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

  // Las vistas privadas exigen sesion; deslogueado se redirige al login.
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
