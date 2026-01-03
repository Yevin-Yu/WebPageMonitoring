const express = require('express');
const { createUser, verifyUser } = require('../services/userService');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const tokenService = require('../services/tokenService');
const crypto = require('crypto');

const router = express.Router();

/**
 * 用户注册
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空', code: 'VALIDATION_ERROR' });
  }

  const user = await createUser(username, password, email);
  res.json({ success: true, user });
}));

/**
 * 用户登录
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const user = await verifyUser(username, password);
  const token = crypto.randomBytes(32).toString('hex');
  tokenService.set(token, user.id);

  res.json({
    success: true,
    token,
    user,
  });
}));

/**
 * 用户登出
 */
router.post('/logout', authenticateToken, (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) {
    tokenService.delete(token);
  }
  res.json({ success: true, message: '已登出' });
});

/**
 * 获取当前用户信息
 */
router.get('/me', authenticateToken, (req, res) => {
  res.json({ userId: req.userId });
});

module.exports = router;


