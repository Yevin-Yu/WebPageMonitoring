import React, { useState } from 'react';
import { exportEvents } from '../utils/export';
import { useEvents } from '../hooks/useEvents';
import dayjs from 'dayjs';

/**
 * 格式化访问时长
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时长字符串
 */
function formatVisitDuration(seconds) {
  if (!seconds || seconds === 0) return '-';
  if (seconds < 60) return `${seconds}秒`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`;
}

/**
 * 事件列表组件
 * @param {string} projectKey - 项目 Key
 */
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
    <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
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
          <div style={{ 
            overflowX: 'auto', 
            overflowY: 'visible', 
            width: '100%',
            maxWidth: '100%',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
            boxSizing: 'border-box'
          }}>
            <table className="table" style={{ minWidth: '1200px', width: 'max-content' }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap', minWidth: '140px' }}>访问时间</th>
                  <th style={{ whiteSpace: 'nowrap', minWidth: '80px' }}>地域</th>
                  <th style={{ whiteSpace: 'nowrap', minWidth: '100px' }}>来源</th>
                  <th style={{ whiteSpace: 'nowrap', minWidth: '200px' }}>入口页面</th>
                  <th style={{ whiteSpace: 'nowrap', minWidth: '120px' }}>搜索词</th>
                  <th style={{ whiteSpace: 'nowrap', minWidth: '120px' }}>访问IP</th>
                  <th style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>访客标识码</th>
                  <th style={{ whiteSpace: 'nowrap', minWidth: '100px' }}>访问时长</th>
                  <th style={{ whiteSpace: 'nowrap', minWidth: '80px' }}>访问页数</th>
                  <th style={{ whiteSpace: 'nowrap', minWidth: '90px' }}>类型</th>
                  <th style={{ whiteSpace: 'nowrap', minWidth: '200px' }}>当前页面</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                    <tr key={event.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                        {dayjs(event.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                      </td>
                      <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        {event.region || '-'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        {event.source || '-'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', wordBreak: 'break-all' }}>
                        {event.entry_page ? (
                          <a
                            href={event.entry_page}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="table-link"
                            style={{ fontSize: '0.8125rem' }}
                            title={event.entry_page}
                          >
                            {event.entry_page}
                          </a>
                        ) : '-'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        {event.search_keyword || '-'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        {event.user_ip || '-'}
                      </td>
                      <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {event.visitor_id ? (
                          <span title={event.visitor_id}>
                            {event.visitor_id}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        {formatVisitDuration(event.visit_duration)}
                      </td>
                      <td style={{ fontSize: '0.8125rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {event.page_count || '-'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`badge ${getEventTypeBadge(event.type)}`}>
                          {event.type === 'pageview' ? '页面访问' : 
                           event.type === 'click' ? '点击' : 
                           event.type === 'error' ? '错误' : event.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', wordBreak: 'break-all' }}>
                        {event.page_url ? (
                          <a
                            href={event.page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="table-link"
                            style={{ fontSize: '0.8125rem' }}
                            title={event.page_url}
                          >
                            {event.page_url}
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

