import React from 'react';

function ErrorAnalysis({ topErrors }) {
  if (!topErrors || topErrors.length === 0) {
    return (
      <div className="card">
        <h3 className="table-title">错误分析</h3>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          暂无错误数据
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="table-title">错误聚合分析</h3>
      <div className="errors-list">
        {topErrors.map((error, index) => (
          <div key={index} className="error-item">
            <div className="error-item-header">
              <div className="error-rank">{index + 1}</div>
              <div className="error-main">
                <div className="error-message">{error.message || '未知错误'}</div>
                <div className="error-meta">
                  <span>出现次数: {error.count || 0}</span>
                  <span>首次出现: {error.firstSeen ? new Date(error.firstSeen).toLocaleString('zh-CN') : '-'}</span>
                  <span>最近出现: {error.lastSeen ? new Date(error.lastSeen).toLocaleString('zh-CN') : '-'}</span>
                </div>
              </div>
            </div>
            {error.samples && error.samples.length > 0 && (
              <details className="error-samples">
                <summary style={{ cursor: 'pointer', color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  查看错误样本 ({error.samples.length})
                </summary>
                <div style={{ marginTop: '0.5rem' }}>
                  {error.samples.map((sample, idx) => (
                    <div key={idx} style={{ 
                      padding: '0.75rem', 
                      background: 'rgba(0, 0, 0, 0.02)', 
                      borderRadius: '4px',
                      marginBottom: '0.5rem',
                      fontSize: '0.8125rem'
                    }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <strong>时间:</strong> {sample.timestamp ? new Date(sample.timestamp).toLocaleString('zh-CN') : '-'}
                      </div>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <strong>页面:</strong> {sample.page || '-'}
                      </div>
                      {sample.stack && (
                        <details style={{ marginTop: '0.5rem' }}>
                          <summary style={{ cursor: 'pointer', color: '#666' }}>堆栈信息</summary>
                          <pre style={{ 
                            marginTop: '0.5rem', 
                            padding: '0.5rem', 
                            background: 'rgba(0, 0, 0, 0.05)', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem',
                            overflow: 'auto',
                            maxHeight: '150px'
                          }}>
                            {sample.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ErrorAnalysis;

