import { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      if (!username || !password) {
        throw new Error('用户名和密码不能为空');
      }

      const response = await authAPI.login(username, password);
      
      if (!response || !response.data) {
        throw new Error('登录响应数据格式错误');
      }

      if (response.data.success) {
        if (!response.data.token || !response.data.user) {
          throw new Error('登录返回数据不完整');
        }

        try {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
          return response.data;
        } catch (storageError) {
          throw new Error('保存登录信息失败，请检查浏览器设置');
        }
      } else {
        throw new Error(response.data.error || '登录失败');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, password, email) => {
    try {
      if (!username || !password) {
        throw new Error('用户名和密码不能为空');
      }

      const response = await authAPI.register(username, password, email);
      
      if (!response || !response.data) {
        throw new Error('注册响应数据格式错误');
      }

      if (response.data.success) {
        return await login(username, password);
      } else {
        throw new Error(response.data.error || '注册失败');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, loading, login, register, logout };
}


