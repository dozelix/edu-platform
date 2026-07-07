import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Aquí podríamos enviar el error a un servicio de monitorización
    // console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border rounded shadow p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Se produjo un error</h2>
            <p className="text-sm text-gray-600 mb-4">La aplicación encontró un problema inesperado.</p>
            <details className="text-left text-xs text-gray-500 mb-4">
              <summary className="cursor-pointer">Detalles (desplegar)</summary>
              <pre className="whitespace-pre-wrap">{String(this.state.error)}</pre>
            </details>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-2 bg-[#3b1c8c] text-white rounded"
                onClick={() => window.location.reload()}
              >
                Recargar
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
