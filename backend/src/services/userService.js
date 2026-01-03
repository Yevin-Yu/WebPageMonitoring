const { readUsers, writeUsers } = require('../repositories/userRepository');
const { validateUsername, validatePassword, validateEmail } = require('../utils/validator');
const { ValidationError } = require('../utils/errors');
const crypto = require('crypto');

/**
 * 创建用户
 */
async function createUser(username, password, email = '') {
  try {
    // 验证输入
    const validatedUsername = validateUsername(username);
    const validatedPassword = validatePassword(password);
    const validatedEmail = validateEmail(email);

    const users = readUsers();

    // 检查用户名是否已存在
    if (users.some(u => u.username === validatedUsername)) {
      throw new ValidationError('用户名已存在');
    }

    const passwordHash = crypto.createHash('sha256').update(validatedPassword).digest('hex');
    const now = new Date().toISOString();

    const existingIds = users.map(u => u.id || 0).filter(id => id > 0);
    const newId = existingIds.length > 0
      ? Math.max(...existingIds) + 1
      : 1;

    const user = {
      id: newId,
      username: validatedUsername,
      password_hash: passwordHash,
      email: validatedEmail,
      created_at: now,
      updated_at: now,
    };

    users.push(user);
    writeUsers(users);

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error('创建用户失败: ' + error.message);
  }
}

/**
 * 验证用户登录
 */
async function verifyUser(username, password) {
  try {
    if (!username || !password) {
      throw new ValidationError('用户名和密码不能为空');
    }

    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      throw new ValidationError('用户名或密码错误');
    }

    if (!user.password_hash) {
      throw new Error('用户数据异常');
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password_hash !== passwordHash) {
      throw new ValidationError('用户名或密码错误');
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error('验证用户失败: ' + error.message);
  }
}

module.exports = { createUser, verifyUser };


