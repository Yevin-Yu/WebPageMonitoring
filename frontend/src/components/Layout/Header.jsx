import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="admin-header">
      <div className="header-left">
        <h1 className="header-title">前端页面监控</h1>
      </div>
      <div className="header-right">
        {user && (
          <>
            <div className="user-info">
              <span className="username">{user.username}</span>
            </div>
            <button className="btn btn-logout" onClick={logout}>
              登出
            </button>
          </>
        )}
      </div>
    </header>
  );
}


