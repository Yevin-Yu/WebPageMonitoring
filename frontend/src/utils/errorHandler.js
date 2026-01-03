/**
 * 前端错误处理工具
 */

/**
 * 获取友好的错误消息
 */
export function getErrorMessage(error) {
  if (!error) {
    return '发生未知错误';
  }

  // 网络错误
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return '请求超时，请检查网络连接';
  }

  if (error.message === 'Network Error' || !error.response) {
    return '网络连接失败，请检查网络';
  }

  // HTTP 错误
  const status = error.response?.status;
  const errorData = error.response?.data;

  if (status === 400) {
    return errorData?.error || '请求参数错误';
  }

  if (status === 401) {
    return '登录已过期，请重新登录';
  }

  if (status === 403) {
    return '无权访问此资源';
  }

  if (status === 404) {
    return '请求的资源不存在';
  }

  if (status === 500) {
    return errorData?.error || '服务器内部错误';
  }

  // 返回服务器错误消息或默认消息
  return errorData?.error || error.message || '操作失败，请重试';
}

/**
 * 判断是否为可重试的错误
 */
export function isRetryableError(error) {
  if (!error || !error.response) {
    return true; // 网络错误可以重试
  }

  const status = error.response.status;
  // 5xx 错误和 429 可以重试
  return status >= 500 || status === 429;
}

