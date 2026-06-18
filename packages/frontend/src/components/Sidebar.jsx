import React from 'react'
import { IconGraduationCap, IconClose, IconLogOut, IconGrid, IconUsers, IconBook, IconBarChart, IconSettings } from './icons/Icons'

const NAV_ITEMS = [
  { id: 'dashboard', icon: <IconGrid />, label: 'Dashboard' },
  { id: 'users', icon: <IconUsers />, label: 'Usuarios' },
  { id: 'courses', icon: <IconBook />, label: 'Cursos' },
  { id: 'grades', icon: <IconBarChart />, label: 'Calificaciones' },
  { id: 'settings', icon: <IconSettings />, label: 'Configuración' },
]

export default function Sidebar({ activeNav, sidebarOpen, setSidebarOpen, handleNav }) {
  return (
    <>
      {sidebarOpen && (
        <div className="db-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      <aside className={`db-sidebar${sidebarOpen ? ' open' : ''}`} role="navigation" aria-label="Menú principal">
        <div className="db-sidebar__brand">
          <div className="db-sidebar__brand-icon" aria-hidden="true">
            <IconGraduationCap />
          </div>
          <div className="db-sidebar__brand-text">
            <div className="db-sidebar__brand-name">EduPlatform</div>
            <div className="db-sidebar__brand-sub">Panel de control</div>
          </div>
          <button className="db-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
            <IconClose />
          </button>
        </div>

        <nav className="db-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`db-sidebar__nav-item${activeNav === item.id ? ' active' : ''}`}
              onClick={() => handleNav(item.id)}
              aria-current={activeNav === item.id ? 'page' : undefined}
            >
              <span className="db-sidebar__nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="db-sidebar__footer">
          <button className="db-sidebar__logout">
            <IconLogOut />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}