/**
 * 本地存储服务
 * 封装 localStorage 操作，提供统一的错误处理和类型安全
 */
import { STORAGE_KEYS } from './constants';

class StorageService {
  /**
   * 获取存储的值
   * @param {string} key - 存储键名
   * @returns {any|null} 存储的值，不存在或解析失败返回 null
   */
  get(key) {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * 设置存储值
   * @param {string} key - 存储键名
   * @param {any} value - 要存储的值
   * @returns {boolean} 是否成功
   */
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * 删除存储值
   * @param {string} key - 存储键名
   */
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error);
    }
  }

  /**
   * 清空所有存储
   */
  clear() {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }

  /**
   * 获取认证 token
   * @returns {string|null}
   */
  getToken() {
    return this.get(STORAGE_KEYS.TOKEN);
  }

  /**
   * 设置认证 token
   * @param {string} token
   * @returns {boolean}
   */
  setToken(token) {
    return this.set(STORAGE_KEYS.TOKEN, token);
  }

  /**
   * 获取用户信息
   * @returns {object|null}
   */
  getUser() {
    return this.get(STORAGE_KEYS.USER);
  }

  /**
   * 设置用户信息
   * @param {object} user
   * @returns {boolean}
   */
  setUser(user) {
    return this.set(STORAGE_KEYS.USER, user);
  }

  /**
   * 清除认证信息
   */
  clearAuth() {
    this.remove(STORAGE_KEYS.TOKEN);
    this.remove(STORAGE_KEYS.USER);
  }

  /**
   * 检查是否已登录
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken() && !!this.getUser();
  }
}

export const storage = new StorageService();
