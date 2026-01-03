import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30秒超时
});

// 请求拦截器：添加认证 token
client.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('请求拦截器错误:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理网络错误
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        error.message = '请求超时，请稍后重试';
      } else if (error.message === 'Network Error') {
        error.message = '网络连接失败，请检查网络';
      }
    }

    // 处理认证错误
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 延迟跳转，避免在错误处理中立即跳转
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }

    return Promise.reject(error);
  }
);

export default client;


