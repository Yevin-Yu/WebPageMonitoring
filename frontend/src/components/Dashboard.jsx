import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../api/projects';
import { LineChart } from './Charts/LineChart';
import { PieChart } from './Charts/PieChart';
import { BarChart } from './Charts/BarChart';
import { getErrorMessage } from '../utils/errorHandler';

function Dashboard({ projectKey }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    if (projectKey) {
      loadStats();
    }
  }, [projectKey, timeRange]);

  const loadStats = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!projectKey) {
        throw new Error('项目Key无效');
      }

      const now = new Date();
      let startTime;

      switch (timeRange) {
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = null;
      }

      const response = await projectsAPI.getStats(projectKey, startTime?.toISOString(), undefined);
      
      if (!response || !response.data) {
        throw new Error('返回数据格式错误');
      }

      setStats(response.data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button className="btn btn-primary" onClick={loadStats} style={{ marginTop: '1rem' }}>
          重试
        </button>
      </div>
    );
  }

  if (!stats) {
    return <div className="error">无法加载统计数据</div>;
  }

  // 准备图表数据
  const eventTypeData = [
    { name: '页面访问', value: stats.pageviews || 0 },
    { name: '点击事件', value: stats.clicks || 0 },
    { name: '错误事件', value: stats.errors || 0 },
  ].filter(item => item.value > 0);

  const topPagesData = (stats.topPages || []).slice(0, 10).map((page, index) => ({
    name: page.page_title || page.page_url.substring(0, 20) + '...',
    value: page.count,
  }));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">数据概览</h2>
        <div className="time-range-selector">
          <button
            className={`time-btn ${timeRange === '24h' ? 'active' : ''}`}
            onClick={() => setTimeRange('24h')}
          >
            24小时
          </button>
          <button
            className={`time-btn ${timeRange === '7d' ? 'active' : ''}`}
            onClick={() => setTimeRange('7d')}
          >
            7天
          </button>
          <button
            className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
            onClick={() => setTimeRange('30d')}
          >
            30天
          </button>
        </div>
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

      <div className="charts-grid">
        <div className="chart-card">
          <PieChart data={eventTypeData} title="事件类型分布" />
        </div>
        <div className="chart-card">
          <BarChart data={topPagesData} title="热门页面 TOP 10" />
        </div>
      </div>

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
                    <a
                      href={page.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="table-link"
                    >
                      {page.page_url}
                    </a>
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
