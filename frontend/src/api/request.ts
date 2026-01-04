import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const service: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
});

// Request interceptor
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
service.interceptors.response.use(
  (response) => {
    // Backend returns { success, message, data } structure
    // Extract the data field for API responses
    return response.data.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      const data = error.response.data as any;

      if (status === 401) {
        const userStore = useUserStore();
        userStore.logout();
        ElMessage.error('登录已过期，请重新登录');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Backend returns { success, message, error } structure
      ElMessage.error(data?.message || data?.error || '请求失败');
    } else {
      ElMessage.error('网络错误');
    }
    return Promise.reject(error);
  }
);

export default service;
