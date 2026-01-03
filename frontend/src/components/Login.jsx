import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errorHandler';

function Login() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.username || formData.username.trim().length === 0) {
      setError('用户名不能为空');
      return false;
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      setError('用户名长度必须在3-20个字符之间');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('用户名只能包含字母、数字和下划线');
      return false;
    }

    if (!formData.password || formData.password.length === 0) {
      setError('密码不能为空');
      return false;
    }

    if (formData.password.length < 6 || formData.password.length > 50) {
      setError('密码长度必须在6-50个字符之间');
      return false;
    }

    if (!isLogin && formData.email && formData.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('邮箱格式不正确');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.username.trim(), formData.password);
        navigate('/', { replace: true });
      } else {
        await register(formData.username.trim(), formData.password, formData.email.trim());
        navigate('/', { replace: true });
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="card-title">{isLogin ? '登录' : '注册'}</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                setError('');
              }}
              maxLength={20}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setError('');
              }}
              maxLength={50}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">邮箱（可选）</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setError('');
                }}
                maxLength={100}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            type="button"
            className="btn"
            style={{ background: 'transparent', border: 'none', textDecoration: 'underline', padding: 0 }}
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ username: '', password: '', email: '' });
            }}
          >
            {isLogin ? '还没有账号？点击注册' : '已有账号？点击登录'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
