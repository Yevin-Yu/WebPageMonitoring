import axios from 'axios';
import { storage } from '../utils/storage';
import { API_CONFIG } from '../utils/constants';

const client = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
});

client.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        error.message = '请求超时，请稍后重试';
      } else if (error.message === 'Network Error') {
        error.message = '网络连接失败，请检查网络';
      }
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      storage.clearAuth();
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }

    return Promise.reject(error);
  }
);

export default client;


