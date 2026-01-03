import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * 页面头部组件
 * 显示标题和用户信息
 */
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
        <h1 className="header-title">前端统计</h1>
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


