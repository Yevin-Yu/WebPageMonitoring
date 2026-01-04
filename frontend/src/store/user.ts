import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, type User } from '@/api';
import { ElMessage } from 'element-plus';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const user = ref<User | null>(null);

  const isLoggedIn = computed(() => !!token.value);

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const setUser = (userData: User) => {
    user.value = userData;
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password });
      setToken(response.token);
      setUser(response.user);
      ElMessage.success('登录成功');
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authApi.register({ username, email, password });
      setToken(response.token);
      setUser(response.user);
      ElMessage.success('注册成功');
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
  };

  const fetchCurrentUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      logout();
    }
  };

  return {
    token,
    user,
    isLoggedIn,
    setToken,
    setUser,
    login,
    register,
    logout,
    fetchCurrentUser,
  };
});
