import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    // 可以在这里上报错误到监控服务
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h2 style={{ color: '#8b0000', marginBottom: '1rem' }}>出现错误</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              抱歉，应用遇到了一个错误。请尝试刷新页面或联系管理员。
            </p>
            {this.state.error && (
              <details style={{ marginBottom: '1rem' }}>
                <summary style={{ cursor: 'pointer', color: '#666', marginBottom: '0.5rem' }}>
                  错误详情
                </summary>
                <pre style={{ 
                  background: 'rgba(0, 0, 0, 0.05)', 
                  padding: '1rem', 
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={this.handleReset}>
                重试
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => window.location.reload()}
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

