import React, { useState, useEffect, useRef } from 'react';
import { analyticsAPI } from '../api/analytics';
import { LineChart } from './Charts/LineChart';
import { getErrorMessage } from '../utils/errorHandler';
import { REALTIME_INTERVAL } from '../utils/constants';

function RealtimeDashboard({ projectKey }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectKey) {
      loadStats();
      const interval = setInterval(loadStats, REALTIME_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [projectKey]);

  const loadStats = async () => {
    try {
      setError(null);
      const response = await analyticsAPI.getRealtimeStats(projectKey, 30);
      if (!response || !response.data) {
        throw new Error('返回数据格式错误');
      }
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return <div className="loading">加载中...</div>;
  }

  if (error && !stats) {
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
    return <div className="error">无法加载实时数据</div>;
  }

  const timelineData = stats.timeline.map(item => ({
    name: item.time,
    pageviews: item.pageviews,
    clicks: item.clicks,
    errors: item.errors,
    visitors: item.visitors,
  }));

  return (
    <div className="realtime-dashboard">
      <div className="realtime-header">
        <h2 className="dashboard-title">实时监控</h2>
        <div className="realtime-indicator">
          <span className="realtime-dot"></span>
          <span style={{ fontSize: '0.875rem', color: '#666' }}>实时更新中</span>
        </div>
      </div>

      <div className="realtime-stats-grid">
        <div className="realtime-stat-card">
          <div className="realtime-stat-label">当前在线</div>
          <div className="realtime-stat-value">{stats.current.visitors}</div>
          <div className="realtime-stat-desc">访客数</div>
        </div>
        <div className="realtime-stat-card">
          <div className="realtime-stat-label">页面访问</div>
          <div className="realtime-stat-value">{stats.current.pageviews}</div>
          <div className="realtime-stat-desc">最近5分钟</div>
        </div>
        <div className="realtime-stat-card">
          <div className="realtime-stat-label">点击事件</div>
          <div className="realtime-stat-value">{stats.current.clicks}</div>
          <div className="realtime-stat-desc">最近5分钟</div>
        </div>
        <div className="realtime-stat-card">
          <div className="realtime-stat-label">错误事件</div>
          <div className="realtime-stat-value" style={{ color: stats.current.errors > 0 ? '#8b0000' : '#666' }}>
            {stats.current.errors}
          </div>
          <div className="realtime-stat-desc">最近5分钟</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 className="table-title">实时趋势</h3>
        <LineChart 
          data={timelineData} 
          title=""
          xKey="name"
          yKeys={['pageviews', 'clicks', 'visitors']}
        />
      </div>
    </div>
  );
}

export default RealtimeDashboard;

