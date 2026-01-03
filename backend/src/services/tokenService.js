/**
 * Token 服务
 * 生产环境应使用 Redis 或数据库存储
 */
class TokenService {
  constructor() {
    this.tokens = new Map();
  }

  set(token, userId) {
    this.tokens.set(token, userId);
  }

  get(token) {
    return this.tokens.get(token);
  }

  delete(token) {
    return this.tokens.delete(token);
  }
}

module.exports = new TokenService();


