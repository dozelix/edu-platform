import React from 'react'
import { ChevronRight } from 'lucide-react'
import {
  IconGraduationCap,
  IconClose,
  IconLogOut,
  IconBook,
  IconBarChart,
} from './icons/Icons'

const NAV_ITEMS = [
  { id: 'courses', icon: <IconBook />, label: 'Catálogo' },
  { id: 'learning', icon: <IconBarChart />, label: 'Mi Aprendizaje' },
]

export default function Sidebar({
  activeNav,
  sidebarOpen,
  setSidebarOpen,
  handleNav,
  isAuthenticated,
  onLogout,
  dbStatus,
}) {
  return (
    <>
      {sidebarOpen && (
        <div className="db-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      <aside
        className={`db-sidebar${sidebarOpen ? ' open' : ''}`}
        role="navigation"
        aria-label="Menú principal"
      >
        <div className="db-sidebar__brand">
          <div className="db-sidebar__brand-icon" aria-hidden="true">
            <IconGraduationCap />
          </div>
          <div className="db-sidebar__brand-text">
            <div className="db-sidebar__brand-name">EduPlatform</div>
            <div className="db-sidebar__brand-sub">Panel de control</div>
          </div>
          <button
            className="db-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <IconClose />
          </button>
        </div>

        <nav className="db-sidebar__nav">
          <p className="db-sidebar__nav-label">Menú</p>
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
              {activeNav === item.id && (
                <ChevronRight size={14} className="db-sidebar__nav-chevron" aria-hidden="true" />
              )}
            </button>
          ))}
        </nav>

        <div className="db-sidebar__footer">
          {dbStatus && (
            <p className="db-sidebar__status" role="status">
              <span
                className={`db-sidebar__status-dot${
                  dbStatus === 'connected'
                    ? ' is-connected'
                    : dbStatus === 'error'
                      ? ' is-error'
                      : ''
                }`}
                aria-hidden="true"
              />
              DB: {dbStatus.toUpperCase()}
            </p>
          )}
          {isAuthenticated && (
            <button className="db-sidebar__logout" onClick={onLogout}>
              <IconLogOut />
              Cerrar sesión
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
