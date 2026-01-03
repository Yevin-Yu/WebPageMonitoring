import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../api/events';
import { getErrorMessage } from '../utils/errorHandler';
import dayjs from 'dayjs';

function EventList({ projectKey }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (projectKey) {
      loadEvents();
    }
  }, [projectKey, page, filterType]);

  const loadEvents = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!projectKey) {
        throw new Error('项目Key无效');
      }

      const params = {
        page: Math.max(1, page),
        pageSize: 50,
        type: filterType || undefined,
      };

      const response = await eventsAPI.list(projectKey, params);
      
      if (!response || !response.data) {
        throw new Error('返回数据格式错误');
      }

      setEvents(Array.isArray(response.data.data) ? response.data.data : []);
      setTotalPages(Math.max(1, response.data.totalPages || 1));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error('加载事件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeBadge = (type) => {
    const badges = {
      pageview: 'badge-primary',
      click: 'badge-success',
      error: 'badge-danger',
    };
    return badges[type] || 'badge-warning';
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button className="btn btn-primary" onClick={loadEvents} style={{ marginTop: '1rem' }}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label style={{ fontSize: '0.875rem' }}>事件类型筛选:</label>
        <select
          className="form-input"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(1);
          }}
          style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
        >
          <option value="">全部</option>
          <option value="pageview">页面访问</option>
          <option value="click">点击事件</option>
          <option value="error">错误事件</option>
        </select>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          暂无事件数据
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>类型</th>
                  <th>页面 URL</th>
                  <th>IP 地址</th>
                  <th>User Agent</th>
                  <th>详细信息</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                      {dayjs(event.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    </td>
                    <td>
                      <span className={`badge ${getEventTypeBadge(event.type)}`}>
                        {event.type}
                      </span>
                    </td>
                    <td>
                      <a
                        href={event.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#333', fontSize: '0.875rem', wordBreak: 'break-all', textDecoration: 'underline' }}
                      >
                        {event.page_url}
                      </a>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{event.user_ip || '-'}</td>
                    <td style={{ fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.user_agent || '-'}
                    </td>
                    <td>
                      <details style={{ fontSize: '0.875rem' }}>
                        <summary style={{ cursor: 'pointer', color: '#333', textDecoration: 'underline' }}>查看</summary>
                        <pre style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px', fontSize: '0.75rem', overflow: 'auto', maxHeight: '200px' }}>
                          {JSON.stringify(event.event_data, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
              >
                上一页
              </button>
              <span style={{ fontSize: '0.875rem' }}>
                第 {page} 页，共 {totalPages} 页
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EventList;

