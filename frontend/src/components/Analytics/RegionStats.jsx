import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../api/analytics';
import { getErrorMessage } from '../../utils/errorHandler';
import { BarChart } from '../Charts/BarChart';

function RegionStats({ projectKey, startTime, endTime }) {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectKey) {
      loadRegions();
    }
  }, [projectKey, startTime, endTime]);

  const loadRegions = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await analyticsAPI.getRegionStats(projectKey, startTime, endTime);
      if (!response || !response.data) {
        throw new Error('返回数据格式错误');
      }
      setRegions(response.data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error('加载地域统计失败:', error);
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
        <button className="btn btn-primary" onClick={loadRegions} style={{ marginTop: '1rem' }}>
          重试
        </button>
      </div>
    );
  }

  const chartData = regions.slice(0, 20).map(r => ({
    name: r.region || '未知',
    value: r.pageviews || 0,
  }));

  return (
    <div>
      <div className="card">
        <h3 className="table-title">地域分布</h3>
        {regions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            暂无地域数据
          </div>
        ) : (
          <>
            <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
              <BarChart data={chartData} title="地域访问量 TOP 20" />
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>地域</th>
                  <th>页面访问</th>
                  <th>独立访客</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((region, index) => (
                  <tr key={index}>
                    <td>{region.region || '未知'}</td>
                    <td>{region.pageviews}</td>
                    <td>{region.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default RegionStats;

