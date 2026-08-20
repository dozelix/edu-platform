import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Error tracking hook
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center p-6">
          <article className="max-w-lg w-full bg-white border border-default shadow p-6 text-center space-y-4">
            <header className="space-y-1">
              <h1 className="text-xl font-bold text-body">Se produjo un error</h1>
              <p className="text-sm text-muted-color">La aplicación encontró un problema inesperado.</p>
            </header>
            <details className="text-left text-xs text-muted-color bg-body p-3 rounded">
              <summary className="cursor-pointer font-semibold">Detalles (desplegar)</summary>
              <pre className="whitespace-pre-wrap mt-2">{String(this.state.error)}</pre>
            </details>
            <footer className="flex justify-center gap-3">
              <button
                className="px-4 py-2 bg-primary text-white rounded font-medium cursor-pointer"
                onClick={() => window.location.reload()}
                type="button"
              >
                Recargar
              </button>
            </footer>
          </article>
        </main>
      )
    }
    return this.props.children
  }
}
