import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', label: '项目管理', icon: '📊' },
  { path: '/monitoring', label: '项目监控', icon: '📈' },
];

/**
 * 侧边栏导航组件
 */
export function Sidebar() {
  const location = useLocation();
  const isProjectDetail = location.pathname.startsWith('/projects/');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>监控平台</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
        {isProjectDetail && (
          <Link
            to="/"
            className="sidebar-item"
          >
            <span className="sidebar-icon">←</span>
            <span className="sidebar-label">返回列表</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}

