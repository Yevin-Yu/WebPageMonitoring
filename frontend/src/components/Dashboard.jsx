import React, { useState, useMemo } from 'react';
import { LineChart } from './Charts/LineChart';
import { PieChart } from './Charts/PieChart';
import { BarChart } from './Charts/BarChart';
import WebVitals from './Analytics/WebVitals';
import DeviceBrowserStats from './Analytics/DeviceBrowserStats';
import ErrorAnalysis from './Analytics/ErrorAnalysis';
import { useStats } from '../hooks/useStats';

function Dashboard({ projectKey, timeRange: timeRangeProp }) {
  const [internalTimeRange, setInternalTimeRange] = useState('24h');
  const timeRange = timeRangeProp || internalTimeRange;
  const { stats, loading, error, refetch } = useStats(projectKey, timeRange);

  const eventTypeData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: '页面访问', value: stats.pageviews || 0 },
      { name: '点击事件', value: stats.clicks || 0 },
      { name: '错误事件', value: stats.errors || 0 },
    ].filter(item => item.value > 0);
  }, [stats?.pageviews, stats?.clicks, stats?.errors]);

  const topPagesData = useMemo(() => {
    if (!stats?.topPages) return [];
    return stats.topPages.slice(0, 10).map((page) => ({
      name: page.page_title || (page.page_url ? page.page_url.substring(0, 20) + '...' : '未知页面'),
      value: page.count,
    }));
  }, [stats?.topPages]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button className="btn btn-primary" onClick={refetch} style={{ marginTop: '1rem' }}>
          重试
        </button>
      </div>
    );
  }

  if (!stats) {
    return <div className="error">无法加载统计数据</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">数据概览</h2>
        {!timeRangeProp && (
          <div className="time-range-selector">
            <button
              className={`time-btn ${timeRange === '24h' ? 'active' : ''}`}
              onClick={() => setInternalTimeRange('24h')}
            >
              24小时
            </button>
            <button
              className={`time-btn ${timeRange === '7d' ? 'active' : ''}`}
              onClick={() => setInternalTimeRange('7d')}
            >
              7天
            </button>
            <button
              className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
              onClick={() => setInternalTimeRange('30d')}
            >
              30天
            </button>
          </div>
        )}
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_events || 0}</div>
            <div className="stat-label">总事件数</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.unique_visitors || 0}</div>
            <div className="stat-label">独立访客</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pageviews || 0}</div>
            <div className="stat-label">页面访问</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🖱️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.clicks || 0}</div>
            <div className="stat-label">点击事件</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.errors || 0}</div>
            <div className="stat-label">错误事件</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌐</div>
          <div className="stat-content">
            <div className="stat-value">{stats.unique_pages || 0}</div>
            <div className="stat-label">独立页面</div>
          </div>
        </div>
      </div>

      {stats.timeTrend && stats.timeTrend.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="table-title">访问趋势</h3>
          <LineChart 
            data={stats.timeTrend.map(item => ({
              time: item.time || '',
              pageviews: item.pageviews || 0,
              clicks: item.clicks || 0,
              errors: item.errors || 0,
            }))} 
            title=""
            xKey="time"
            yKeys={['pageviews', 'clicks', 'errors']}
            colors={['#1a1a1a', '#666', '#8b0000']}
          />
        </div>
      )}

      <div className="charts-grid">
        <div className="chart-card">
          <PieChart data={eventTypeData} title="事件类型分布" />
        </div>
        <div className="chart-card">
          <BarChart data={topPagesData} title="热门页面 TOP 10" />
        </div>
      </div>

      {stats.webVitals && (
        <WebVitals webVitals={stats.webVitals} />
      )}

      {(stats.devices || stats.browsers || stats.os) && (
        <DeviceBrowserStats 
          devices={stats.devices} 
          browsers={stats.browsers} 
          os={stats.os} 
        />
      )}

      {stats.topErrors && stats.topErrors.length > 0 && (
        <ErrorAnalysis topErrors={stats.topErrors} />
      )}

      {stats.topPages && stats.topPages.length > 0 && (
        <div className="table-card">
          <h3 className="table-title">热门页面详情</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>排名</th>
                <th>页面标题</th>
                <th>页面 URL</th>
                <th>访问次数</th>
              </tr>
            </thead>
            <tbody>
              {stats.topPages.map((page, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{page.page_title || '-'}</td>
                  <td>
                    {page.page_url ? (
                      <a
                        href={page.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="table-link"
                      >
                        {page.page_url}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{page.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
