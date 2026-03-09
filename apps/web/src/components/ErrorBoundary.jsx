import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'monospace', maxWidth: '800px', margin: 'auto' }}>
                    <h1 style={{ color: 'red', fontSize: '1.5rem' }}>Something went wrong</h1>
                    <pre style={{ background: '#fee', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                        {this.state.error?.toString()}
                    </pre>
                    <details style={{ marginTop: '1rem' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Stack Trace</summary>
                        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </details>
                    <button onClick={() => { this.setState({ hasError: false, error: null, errorInfo: null }); window.location.href = '/login'; }}
                        style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        Kembali ke Login
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
