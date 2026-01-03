import React from 'react';

/**
 * Web Vitals 性能指标组件
 * @param {Object} webVitals - Web Vitals 数据
 */
function WebVitals({ webVitals }) {
  if (!webVitals) {
    return (
      <div className="card">
        <h3 className="table-title">Core Web Vitals</h3>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          暂无性能数据
        </div>
      </div>
    );
  }

  const getVitalStatus = (value, thresholds) => {
    if (!value) return { status: 'unknown', label: '无数据' };
    if (value <= thresholds.good) return { status: 'good', label: '良好' };
    if (value <= thresholds.needsImprovement) return { status: 'warning', label: '需改进' };
    return { status: 'poor', label: '差' };
  };

  const vitals = [
    {
      name: 'LCP',
      fullName: 'Largest Contentful Paint',
      desc: '最大内容绘制',
      value: webVitals.lcp,
      thresholds: { good: 2500, needsImprovement: 4000 },
      unit: 'ms',
    },
    {
      name: 'FID',
      fullName: 'First Input Delay',
      desc: '首次输入延迟',
      value: webVitals.fid,
      thresholds: { good: 100, needsImprovement: 300 },
      unit: 'ms',
    },
    {
      name: 'CLS',
      fullName: 'Cumulative Layout Shift',
      desc: '累积布局偏移',
      value: webVitals.cls,
      thresholds: { good: 0.1, needsImprovement: 0.25 },
      unit: '',
    },
    {
      name: 'FCP',
      fullName: 'First Contentful Paint',
      desc: '首次内容绘制',
      value: webVitals.fcp,
      thresholds: { good: 1800, needsImprovement: 3000 },
      unit: 'ms',
    },
    {
      name: 'TTFB',
      fullName: 'Time to First Byte',
      desc: '首字节时间',
      value: webVitals.ttfb,
      thresholds: { good: 800, needsImprovement: 1800 },
      unit: 'ms',
    },
  ];

  return (
    <div className="card">
      <h3 className="table-title">Core Web Vitals 性能指标</h3>
      <div className="web-vitals-grid">
        {vitals.map((vital, index) => {
          const stats = vital.value;
          const avgStatus = stats ? getVitalStatus(stats.avg, vital.thresholds) : { status: 'unknown', label: '无数据' };
          
          return (
            <div key={index} className="web-vital-card">
              <div className="web-vital-header">
                <div>
                  <div className="web-vital-name">{vital.name}</div>
                  <div className="web-vital-fullname">{vital.fullName}</div>
                  <div className="web-vital-desc">{vital.desc}</div>
                </div>
                <div className={`web-vital-badge web-vital-badge-${avgStatus.status}`}>
                  {avgStatus.label}
                </div>
              </div>
              {stats ? (
                <div className="web-vital-stats">
                  <div className="web-vital-stat-item">
                    <span className="web-vital-stat-label">平均值</span>
                    <span className="web-vital-stat-value">
                      {stats.avg}{vital.unit}
                    </span>
                  </div>
                  <div className="web-vital-stat-item">
                    <span className="web-vital-stat-label">P50</span>
                    <span className="web-vital-stat-value">{stats.p50}{vital.unit}</span>
                  </div>
                  <div className="web-vital-stat-item">
                    <span className="web-vital-stat-label">P75</span>
                    <span className="web-vital-stat-value">{stats.p75}{vital.unit}</span>
                  </div>
                  <div className="web-vital-stat-item">
                    <span className="web-vital-stat-label">P95</span>
                    <span className="web-vital-stat-value">{stats.p95}{vital.unit}</span>
                  </div>
                  <div className="web-vital-stat-item">
                    <span className="web-vital-stat-label">样本数</span>
                    <span className="web-vital-stat-value">{stats.count}</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                  暂无数据
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WebVitals;

