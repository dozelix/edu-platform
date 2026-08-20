import React from 'react'
import { IconMenu } from './icons/Icons'

interface TopbarUser {
  name: string
  initials: string
}

interface TopbarProps {
  user: TopbarUser | null
  isAuthenticated: boolean
  onLogin: () => void
  setSidebarOpen: (open: boolean) => void
}

export default function Topbar({ user, isAuthenticated, onLogin, setSidebarOpen }: TopbarProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <header className="db-topbar">
      <div className="db-topbar__left">
        <button
          className="db-topbar__hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
          type="button"
        >
          <IconMenu />
        </button>
        <div className="db-topbar__greeting">
          {isAuthenticated && user ? (
            <>
              <span className="db-topbar__sub">{greeting},</span>
              <span className="db-topbar__name">{user.name}!</span>
            </>
          ) : (
            <>
              <span className="db-topbar__sub">Bienvenido a EduPlatform</span>
              <span className="db-topbar__name">Explora el catálogo</span>
            </>
          )}
        </div>
      </div>

      <div className="db-topbar__actions">
        {isAuthenticated && user ? (
          <div className="db-topbar__avatar" title={`Perfil de ${user.name}`}>
            {user.initials}
          </div>
        ) : (
          <button className="db-topbar__login" onClick={onLogin} type="button">
            Iniciar sesión
          </button>
        )}
      </div>
    </header>
  )
}
