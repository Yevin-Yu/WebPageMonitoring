/**
 * 数据验证工具
 */
const { ValidationError } = require('./errors');

/**
 * 验证项目名称
 */
function validateProjectName(name) {
  if (!name || typeof name !== 'string') {
    throw new ValidationError('项目名称不能为空');
  }
  if (name.trim().length === 0) {
    throw new ValidationError('项目名称不能为空');
  }
  if (name.length > 100) {
    throw new ValidationError('项目名称不能超过100个字符');
  }
  return name.trim();
}

/**
 * 验证用户名
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    throw new ValidationError('用户名不能为空');
  }
  if (username.trim().length === 0) {
    throw new ValidationError('用户名不能为空');
  }
  if (username.length < 3 || username.length > 20) {
    throw new ValidationError('用户名长度必须在3-20个字符之间');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new ValidationError('用户名只能包含字母、数字和下划线');
  }
  return username.trim();
}

/**
 * 验证密码
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('密码不能为空');
  }
  if (password.length < 6 || password.length > 50) {
    throw new ValidationError('密码长度必须在6-50个字符之间');
  }
  return password;
}

/**
 * 验证邮箱
 */
function validateEmail(email) {
  if (!email) {
    return '';
  }
  if (typeof email !== 'string') {
    throw new ValidationError('邮箱格式不正确');
  }
  if (email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('邮箱格式不正确');
    }
  }
  return email.trim();
}

/**
 * 验证项目 Key
 */
function validateProjectKey(projectKey) {
  if (!projectKey || typeof projectKey !== 'string') {
    throw new ValidationError('项目 Key 无效');
  }
  if (projectKey.length !== 32) {
    throw new ValidationError('项目 Key 格式不正确');
  }
  return projectKey;
}

module.exports = {
  validateProjectName,
  validateUsername,
  validatePassword,
  validateEmail,
  validateProjectKey,
};


