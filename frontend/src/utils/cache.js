/**
 * 简单的内存缓存工具
 */

const cache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5分钟

/**
 * 设置缓存
 */
export function setCache(key, value, ttl = DEFAULT_TTL) {
  const expiry = Date.now() + ttl;
  cache.set(key, { value, expiry });
}

/**
 * 获取缓存
 */
export function getCache(key) {
  const item = cache.get(key);
  if (!item) {
    return null;
  }
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

/**
 * 清除缓存
 */
export function clearCache(key) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * 创建带缓存的函数
 */
export function withCache(fn, keyGenerator, ttl = DEFAULT_TTL) {
  return async (...args) => {
    const key = keyGenerator(...args);
    const cached = getCache(key);
    if (cached !== null) {
      return cached;
    }
    const result = await fn(...args);
    setCache(key, result, ttl);
    return result;
  };
}

