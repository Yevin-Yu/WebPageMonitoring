import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

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
            <button className="btn btn-logout" onClick={handleLogout}>
              登出
            </button>
          </>
        )}
      </div>
    </header>
  );
}


