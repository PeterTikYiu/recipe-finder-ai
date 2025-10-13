import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Optionally log to a monitoring service
    // eslint-disable-next-line no-console
    console.error('App crashed with error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Something went wrong</h1>
          <p>
            The app ran into a problem. Try refreshing the page. If the issue persists, check your environment configuration
            (Firebase and API keys) or see the console for details.
          </p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #ddd' }}>
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
