import React, { useState, useEffect } from 'react'

import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import TechStack from './components/Techstack'
import StatsGrid from './components/StatsGrid'
import Checklist from './components/Checklist'
import DbTester from './components/DBTester'
import Dashboard from './features/dashboard/dashboard'
import { LoginRegister } from './components/LoginRegister'

function App() {
  const [dbStatus, setDbStatus] = useState('idle')
  const [result, setResult] = useState('')
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isElectron] = useState(() => typeof window !== 'undefined' && !!window.api)

  // Sync initial status if in Electron environment
  useEffect(() => {
    if (isElectron) {
      setDbStatus('connected')
    }
  }, [isElectron])

  const MOCK_USER = { name: 'Jean', initials: 'JE' }

  const handleNav = (id) => {
    setActiveNav(id)
    setSidebarOpen(false)
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard />
      case 'users':
        return <LoginRegister />
      default:
        return (
          <div className="dashboard">
            <header className="dashboard__header">
              <p className="dashboard__greeting">EduPlatform Dev Panel</p>
              <h1 className="dashboard__title">Sección: {activeNav.toUpperCase()}</h1>
            </header>

            <TechStack />
            <br />
            <StatsGrid />
            <Checklist />

            <DbTester
              isElectron={isElectron}
              dbStatus={dbStatus}
              setDbStatus={setDbStatus}
              result={result}
              setResult={setResult}
            />
          </div>
        )
    }
  }

  return (
    <div className="db-layout">
      <Sidebar
        activeNav={activeNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleNav={handleNav}
        dbStatus={dbStatus}
      />
      <div className="db-main">
        <Topbar user={MOCK_USER} setSidebarOpen={setSidebarOpen} />
        <main className="db-content" id="main">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App
