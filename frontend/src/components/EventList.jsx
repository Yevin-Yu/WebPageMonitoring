import React, { useState } from 'react';
import { exportEvents } from '../utils/export';
import { useEvents } from '../hooks/useEvents';
import dayjs from 'dayjs';

function formatVisitDuration(seconds) {
  if (!seconds || seconds === 0) return '-';
  if (seconds < 60) return `${seconds}秒`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`;
}

function EventList({ projectKey }) {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const { events, totalPages, loading, error } = useEvents(projectKey, {
    page,
    type: filterType,
  });

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

  const handleExport = () => {
    if (!events.length) return;
    const filename = `events_${projectKey}_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
    exportEvents(events, filename);
  };

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
        <button className="btn btn-primary" onClick={handleExport} style={{ fontSize: '0.8125rem' }}>
          📥 导出CSV
        </button>
      </div>

      {events.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          暂无事件数据
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>访问时间</th>
                  <th>地域</th>
                  <th>来源</th>
                  <th>入口页面</th>
                  <th>搜索词</th>
                  <th>访问IP</th>
                  <th>访客标识码</th>
                  <th>访问时长</th>
                  <th>访问页数</th>
                  <th>类型</th>
                  <th>当前页面</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                    <tr key={event.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                        {dayjs(event.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                      </td>
                      <td style={{ fontSize: '0.8125rem' }}>
                        {event.region || '-'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', maxWidth: '120px' }}>
                        {event.source || '-'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', maxWidth: '200px' }}>
                        {event.entry_page ? (
                          <a
                            href={event.entry_page}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="table-link"
                            style={{ fontSize: '0.8125rem' }}
                            title={event.entry_page}
                          >
                            {event.entry_page.length > 30 
                              ? event.entry_page.substring(0, 30) + '...' 
                              : event.entry_page}
                          </a>
                        ) : '-'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', maxWidth: '150px' }}>
                        {event.search_keyword || '-'}
                      </td>
                      <td style={{ fontSize: '0.8125rem' }}>
                        {event.user_ip || '-'}
                      </td>
                      <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', maxWidth: '150px' }}>
                        {event.visitor_id ? (
                          <span title={event.visitor_id}>
                            {event.visitor_id.length > 20 
                              ? event.visitor_id.substring(0, 20) + '...' 
                              : event.visitor_id}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        {formatVisitDuration(event.visit_duration)}
                      </td>
                      <td style={{ fontSize: '0.8125rem', textAlign: 'center' }}>
                        {event.page_count || '-'}
                      </td>
                      <td>
                        <span className={`badge ${getEventTypeBadge(event.type)}`}>
                          {event.type === 'pageview' ? '页面访问' : 
                           event.type === 'click' ? '点击' : 
                           event.type === 'error' ? '错误' : event.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', maxWidth: '200px' }}>
                        {event.page_url ? (
                          <a
                            href={event.page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="table-link"
                            style={{ fontSize: '0.8125rem' }}
                            title={event.page_url}
                          >
                            {event.page_url.length > 40 
                              ? event.page_url.substring(0, 40) + '...' 
                              : event.page_url}
                          </a>
                        ) : '-'}
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

