const userTokens = require('../services/tokenService');

/**
 * 认证中间件
 * 验证请求中的 Bearer Token
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '未授权，请先登录' });
    }

    const userId = userTokens.get(token);
    if (!userId) {
        return res.status(403).json({ error: 'Token 无效或已过期' });
    }

    req.userId = userId;
    next();
}

module.exports = { authenticateToken };


