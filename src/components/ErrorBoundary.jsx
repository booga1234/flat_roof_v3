import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000000', marginBottom: '16px' }}>Something went wrong</h1>
            <p style={{ color: '#666666', marginBottom: '16px' }}>{this.state.error?.message || 'An error occurred'}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              style={{ padding: '8px 16px', backgroundColor: '#0D0D0D', color: '#ffffff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              Reload Page
            </button>
            <pre style={{ marginTop: '16px', textAlign: 'left', fontSize: '12px', color: '#666666', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '4px', overflow: 'auto', maxWidth: '100%' }}>
              {this.state.error?.stack || String(this.state.error)}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

