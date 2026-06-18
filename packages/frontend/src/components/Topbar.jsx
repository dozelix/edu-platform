import React from 'react'
import { IconMenu, IconBell } from './icons/Icons'

export default function Topbar({ user, setSidebarOpen }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <header className="db-topbar">
      <div className="db-topbar__left">
        <button className="db-topbar__hamburger" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
          <IconMenu />
        </button>
        <div className="db-topbar__greeting">
          <span className="db-topbar__sub">{greeting},</span>
          <span className="db-topbar__name">{user.name}!</span>
        </div>
      </div>

      <div className="db-topbar__actions">
        <button className="db-topbar__icon-btn" aria-label="Notificaciones">
          <IconBell />
          <span className="db-topbar__badge" aria-hidden="true">3</span>
        </button>
        <div className="db-topbar__avatar" title={`Perfil de ${user.name}`}>
          {user.initials}
        </div>
      </div>
    </header>
  )
}