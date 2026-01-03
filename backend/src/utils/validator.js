/**
 * 输入验证工具
 */

/**
 * 验证项目名称
 */
function validateProjectName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: '项目名称不能为空' };
  }
  if (name.trim().length === 0) {
    return { valid: false, error: '项目名称不能为空' };
  }
  if (name.length > 100) {
    return { valid: false, error: '项目名称不能超过100个字符' };
  }
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_]+$/.test(name)) {
    return { valid: false, error: '项目名称只能包含中文、英文、数字、空格、连字符和下划线' };
  }
  return { valid: true };
}

/**
 * 验证项目描述
 */
function validateProjectDescription(description) {
  if (description && typeof description === 'string') {
    if (description.length > 500) {
      return { valid: false, error: '项目描述不能超过500个字符' };
    }
  }
  return { valid: true };
}

/**
 * 验证项目Key
 */
function validateProjectKey(key) {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: '项目Key无效' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    return { valid: false, error: '项目Key只能包含字母、数字、连字符和下划线' };
  }
  if (key.length < 3 || key.length > 50) {
    return { valid: false, error: '项目Key长度必须在3-50个字符之间' };
  }
  return { valid: true };
}

/**
 * 验证用户名
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: '用户名不能为空' };
  }
  if (username.trim().length === 0) {
    return { valid: false, error: '用户名不能为空' };
  }
  if (username.length < 3 || username.length > 20) {
    return { valid: false, error: '用户名长度必须在3-20个字符之间' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: '用户名只能包含字母、数字和下划线' };
  }
  return { valid: true };
}

/**
 * 验证密码
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: '密码不能为空' };
  }
  if (password.length < 6 || password.length > 50) {
    return { valid: false, error: '密码长度必须在6-50个字符之间' };
  }
  return { valid: true };
}

/**
 * 验证邮箱
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: '邮箱不能为空' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: '邮箱格式不正确' };
  }
  return { valid: true };
}

/**
 * 清理和转义用户输入
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  // 移除控制字符
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

/**
 * 验证时间范围
 */
function validateTimeRange(startTime, endTime) {
  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, error: '时间格式不正确' };
    }
    if (start > end) {
      return { valid: false, error: '开始时间不能晚于结束时间' };
    }
    // 限制查询范围不超过1年
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    if (end - start > oneYear) {
      return { valid: false, error: '查询时间范围不能超过1年' };
    }
  }
  return { valid: true };
}

/**
 * 验证分页参数
 */
function validatePagination(page, pageSize) {
  const pageNum = parseInt(page, 10);
  const size = parseInt(pageSize, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return { valid: false, error: '页码必须大于0' };
  }
  if (isNaN(size) || size < 1 || size > 1000) {
    return { valid: false, error: '每页数量必须在1-1000之间' };
  }
  return { valid: true, page: pageNum, pageSize: size };
}

module.exports = {
  validateProjectName,
  validateProjectDescription,
  validateProjectKey,
  validateUsername,
  validatePassword,
  validateEmail,
  sanitizeInput,
  validateTimeRange,
  validatePagination,
};
