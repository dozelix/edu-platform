import { useState, useEffect } from 'react'

import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Catalog from './features/courses/Catalog'
import MyLearning from './features/learning/MyLearning'
import Lesson from './features/lesson/Lesson'
import InstructorDashboard from './features/instructor/InstructorDashboard'
import { LoginRegister } from './components/LoginRegister'

const isElectron = typeof globalThis.window !== 'undefined' && !!(globalThis.window as any).api

interface UserData {
  id?: string
  nombre: string
  email: string
  tipo: string
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const isAuthenticated = !!currentUser

  const [dbStatus, setDbStatus] = useState('idle')
  const [activeNav, setActiveNav] = useState('courses')
  const [navHistory, setNavHistory] = useState(['courses'])
  const [activeLeccionId, setActiveLeccionId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [showLogin, setShowLogin] = useState(false)
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null)

  useEffect(() => {
    if (!isElectron) return
    let activo = true
    const win = globalThis.window as any
    win.api
      .invoke('db:estado')
      .then((res: any) => {
        if (activo) setDbStatus(res?.data?.conectado ? 'connected' : 'error')
      })
      .catch(() => {
        if (activo) setDbStatus('error')
      })
    return () => {
      activo = false
    }
  }, [])

  const requireLogin = (cursoId: string | null = null) => {
    setPendingCourseId(cursoId)
    setShowLogin(true)
    setSidebarOpen(false)
  }

  const handleBack = () => {
    setNavHistory((prevHistory) => {
      if (prevHistory.length <= 1) {
        setActiveLeccionId(null)
        setActiveNav('courses')
        return ['courses']
      }
      const nextHistory = prevHistory.slice(0, -1)
      setActiveNav(nextHistory[nextHistory.length - 1])
      if (nextHistory[nextHistory.length - 1] !== 'lesson') {
        setActiveLeccionId(null)
      }
      return nextHistory
    })
  }

  const enrollCourse = async (cursoId: string) => {
    if (!isElectron) return
    try {
      const win = globalThis.window as any
      await win.api.invoke('inscripcion:crear', { cursoId })
    } catch {
      // Ignorar fallo
    }
  }

  const handleLoginSuccess = async (user: UserData) => {
    setCurrentUser(user)
    setShowLogin(false)
    if (pendingCourseId) {
      await enrollCourse(pendingCourseId)
      setPendingCourseId(null)
    }
    setActiveNav('learning')
    setNavHistory((prevHistory) =>
      prevHistory[prevHistory.length - 1] === 'learning' ? prevHistory : [...prevHistory, 'learning']
    )
  }

  const handleLogout = async () => {
    if (isElectron) {
      try {
        const win = globalThis.window as any
        await win.api.invoke('auth:logout')
      } catch {
        // Ignorar fallo
      }
    }
    setCurrentUser(null)
    setActiveNav('courses')
    setActiveLeccionId(null)
    setSidebarOpen(false)
  }

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

  if (isAuthenticated && currentUser && currentUser.tipo === 'instructor') {
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

  const handleNav = (id: string) => {
    if (!isAuthenticated && (id === 'learning' || id === 'lesson')) {
      requireLogin()
      return
    }
    setActiveNav(id)
    setSidebarOpen(false)
    setNavHistory((prevHistory) =>
      prevHistory[prevHistory.length - 1] === id ? prevHistory : [...prevHistory, id]
    )
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'courses':
        return <Catalog user={currentUser} onRequireLogin={(id) => requireLogin(id || null)} onBack={handleBack} />
      case 'learning':
        return (
          <MyLearning
            user={currentUser}
            onContinue={(leccionId) => {
              setActiveLeccionId(leccionId)
              setActiveNav('lesson')
              setNavHistory((prevHistory) =>
                prevHistory[prevHistory.length - 1] === 'lesson' ? prevHistory : [...prevHistory, 'lesson']
              )
            }}
          />
        )
      case 'lesson':
        return (
          <Lesson
            leccionId={activeLeccionId}
            user={currentUser}
            onNavigate={(leccionId) => setActiveLeccionId(leccionId)}
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
