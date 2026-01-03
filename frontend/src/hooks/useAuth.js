import { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { storage } from '../utils/storage';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = storage.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    if (!username || !password) {
      throw new Error('用户名和密码不能为空');
    }

    const response = await authAPI.login(username, password);

    if (!response?.data?.success) {
      throw new Error(response?.data?.error || '登录失败');
    }

    if (!response.data.token || !response.data.user) {
      throw new Error('登录返回数据不完整');
    }

    const tokenSaved = storage.setToken(response.data.token);
    const userSaved = storage.setUser(response.data.user);

    if (!tokenSaved || !userSaved) {
      throw new Error('保存登录信息失败，请检查浏览器设置');
    }

    setUser(response.data.user);
    return response.data;
  };

  const register = async (username, password, email) => {
    if (!username || !password) {
      throw new Error('用户名和密码不能为空');
    }

    const response = await authAPI.register(username, password, email);

    if (!response?.data?.success) {
      throw new Error(response?.data?.error || '注册失败');
    }

    return login(username, password);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    storage.clearAuth();
    setUser(null);
  };

  return { user, loading, login, register, logout };
}


