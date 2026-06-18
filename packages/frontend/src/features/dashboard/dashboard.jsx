import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import StatsGrid from '../../components/StatsGrid'
import CourseCard from '../../components/CourseCard'
import { IconPlus } from '../../components/icons/Icons'
import './Dashboard.css'

const MOCK_USER = { name: 'Jean', initials: 'JE' }

const COURSES = [
  { title: 'Introducción a JavaScript', instructor: 'Ana García', students: 142, rating: 4.8, duration: '12h 30m', status: 'active', progress: 78, accent: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' },
  { title: 'React desde cero', instructor: 'Carlos López', students: 89, rating: 4.6, duration: '8h 15m', status: 'active', progress: 45, accent: 'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)' },
  { title: 'Node.js y Express', instructor: 'María Rodríguez', students: 67, rating: 4.9, duration: '10h 00m', status: 'review', progress: 92, accent: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)' },
  { title: 'MongoDB para desarrolladores', instructor: 'Pedro Martínez', students: 53, rating: 4.5, duration: '6h 45m', status: 'active', progress: 31, accent: 'linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%)' },
  { title: 'TypeScript avanzado', instructor: 'Sofía Herrera', students: 38, rating: 4.7, duration: '9h 20m', status: 'draft', progress: 15, accent: 'linear-gradient(135deg, #ef4444 0%, #fca5a5 100%)' },
  { title: 'CSS y diseño responsive', instructor: 'Luis Castro', students: 201, rating: 4.4, duration: '7h 10m', status: 'active', progress: 60, accent: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' },
]

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNav = (id) => {
    setActiveNav(id)
    setSidebarOpen(false)
  }

  return (
    <div className="db-layout">
      <Sidebar 
        activeNav={activeNav} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        handleNav={handleNav} 
      />

      <div className="db-main">
        <Topbar user={MOCK_USER} setSidebarOpen={setSidebarOpen} />

        <main className="db-content" id="main">
          <div className="db-page-header">
            <div>
              <h1 className="db-page-header__title">Dashboard</h1>
              <p className="db-page-header__sub">Resumen general de la plataforma</p>
            </div>
            <button className="db-cta">
              <IconPlus /> Nuevo curso
            </button>
          </div>

          <StatsGrid />

          <div className="db-section-header">
            <h2 className="db-section-header__title">Cursos recientes</h2>
            <button className="db-link-btn">Ver todos →</button>
          </div>

          <section className="db-courses" aria-label="Cursos recientes">
            {COURSES.map((course, i) => (
              <CourseCard key={course.title} course={course} index={i} />
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}