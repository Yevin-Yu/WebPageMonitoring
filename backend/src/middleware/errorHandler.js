const config = require('../config');
const { AppError } = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const logger = createLogger('ErrorHandler');

/**
 * 统一错误处理中间件
 */
function errorHandler(err, req, res, next) {
  // 记录错误日志
  logger.error('Request error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // 如果是已知错误类型
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
  }

  // 处理文件系统错误
  if (err.code === 'ENOENT') {
    return res.status(500).json({
      error: '数据文件不存在',
      code: 'FILE_NOT_FOUND',
    });
  }

  if (err.code === 'EACCES' || err.code === 'EPERM') {
    return res.status(500).json({
      error: '文件访问权限不足',
      code: 'FILE_PERMISSION_ERROR',
    });
  }

  // 处理 JSON 解析错误
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: '请求数据格式错误',
      code: 'INVALID_JSON',
    });
  }

  // 默认错误
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    error: message,
    code: 'INTERNAL_ERROR',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
}

/**
 * 异步错误包装器
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, asyncHandler };

