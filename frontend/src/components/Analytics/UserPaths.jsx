import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../api/analytics';
import { getErrorMessage } from '../../utils/errorHandler';

function UserPaths({ projectKey, startTime, endTime }) {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectKey) {
      loadPaths();
    }
  }, [projectKey, startTime, endTime]);

  const loadPaths = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await analyticsAPI.getUserPaths(projectKey, startTime, endTime);
      if (!response || !response.data) {
        throw new Error('返回数据格式错误');
      }
      setPaths(response.data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error('加载用户路径失败:', error);
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
        <button className="btn btn-primary" onClick={loadPaths} style={{ marginTop: '1rem' }}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="table-title">用户访问路径</h3>
      {paths.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          暂无路径数据
        </div>
      ) : (
        <div className="paths-list">
          {paths.map((path, index) => (
            <div key={index} className="path-item">
              <div className="path-rank">{index + 1}</div>
              <div className="path-content">
                <div className="path-text">{path.path}</div>
                <div className="path-meta">
                  <span>访问次数: {path.count}</span>
                  <span>页面数: {path.pages}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserPaths;

