# 宝塔面板部署说明

## 📋 部署文件说明

本项目已包含完整的宝塔面板部署配置，文件如下:

### 核心部署文件
- **`DEPLOYMENT.md`** - 详细部署文档（完整步骤）
- **`QUICK_START.md`** - 快速部署指南（简化步骤）
- **`deploy.sh`** - 一键部署脚本
- **`nginx.conf.example`** - Nginx 配置示例

### 配置文件
- **`backend/ecosystem.config.js`** - PM2 进程管理配置
- **`backend/env.example`** - 后端环境变量示例
- **`frontend/env.production.example`** - 前端生产环境变量示例

## 🚀 快速开始

### 方式一: 使用快速部署指南 (推荐新手)
查看 `QUICK_START.md`，按照步骤操作即可。

### 方式二: 使用一键部署脚本 (推荐熟悉命令行的用户)
```bash
cd /www/wwwroot/webpage-monitoring
chmod +x deploy.sh
bash deploy.sh
```

### 方式三: 查看详细文档
查看 `DEPLOYMENT.md` 获取完整的部署说明和故障排除指南。

## 📝 部署前检查清单

- [ ] 服务器已安装宝塔面板
- [ ] 已安装 PM2管理器
- [ ] 已安装 Nginx
- [ ] Node.js 版本 >= 16.x
- [ ] 已准备好域名（或使用 IP 访问）

## 🔧 核心配置要点

### 1. 后端配置 (`backend/.env`)
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://your-domain.com  # 重要：改为你的域名
JWT_SECRET=your-secret-key  # 重要：改为随机强密码
```

### 2. 前端配置 (`frontend/.env.production`)
```env
VITE_API_BASE_URL=/api  # 前后端同域使用相对路径
```

### 3. Nginx 配置要点
- 前端静态文件: `/www/wwwroot/webpage-monitoring/frontend/dist`
- 插件文件路径: `/www/wwwroot/webpage-monitoring/plugin/dist/`
- API 反向代理: `http://127.0.0.1:3001`

## ⚠️ 重要提示

1. **安全配置**
   - 生产环境必须修改 `JWT_SECRET` 为强密码
   - 建议启用 HTTPS
   - 配置防火墙规则

2. **文件权限**
   - 确保 `backend/data` 目录有写权限
   - 建议使用 `www:www` 用户组

3. **端口占用**
   - 后端默认使用 3001 端口
   - 确保端口未被占用

## 📞 获取帮助

如遇问题，请查看:
1. `DEPLOYMENT.md` 中的"常见问题"章节
2. PM2 日志: `pm2 logs webpage-monitoring-backend`
3. Nginx 错误日志: `/www/wwwlogs/webpage-monitoring-error.log`

