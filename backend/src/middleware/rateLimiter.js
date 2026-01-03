const config = require('../config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('RateLimiter');

// 简单的内存存储（生产环境应使用 Redis）
const requestCounts = new Map();

/**
 * 简单的请求限流中间件
 */
function rateLimiter(req, res, next) {
  const clientId = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - config.rateLimit.windowMs;

  // 清理过期记录
  if (requestCounts.has(clientId)) {
    const requests = requestCounts.get(clientId).filter(time => time > windowStart);
    if (requests.length === 0) {
      requestCounts.delete(clientId);
    } else {
      requestCounts.set(clientId, requests);
    }
  }

  // 检查当前请求数
  const requests = requestCounts.get(clientId) || [];
  if (requests.length >= config.rateLimit.maxRequests) {
    logger.warn(`Rate limit exceeded for ${clientId}`);
    return res.status(429).json({
      error: '请求过于频繁，请稍后再试',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((requests[0] + config.rateLimit.windowMs - now) / 1000),
    });
  }

  // 记录本次请求
  requests.push(now);
  requestCounts.set(clientId, requests);

  // 设置响应头
  res.setHeader('X-RateLimit-Limit', config.rateLimit.maxRequests);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, config.rateLimit.maxRequests - requests.length));
  res.setHeader('X-RateLimit-Reset', new Date(now + config.rateLimit.windowMs).toISOString());

  next();
}

module.exports = rateLimiter;

