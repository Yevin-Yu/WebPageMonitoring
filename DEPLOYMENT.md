# 部署指南

本文档提供了 Web Page Monitoring 项目的部署指南。

## 目录

- [使用 Docker Compose 部署](#使用-docker-compose-部署)
- [手动部署](#手动部署)
- [环境变量配置](#环境变量配置)
- [数据库初始化](#数据库初始化)

## 使用 Docker Compose 部署

这是最简单快捷的部署方式。

### 1. 克隆项目

```bash
git clone <repository-url>
cd WebPageMonitoring
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，修改数据库密码等配置：

```env
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=monitoring_user
DB_PASSWORD=your_secure_password
DB_DATABASE=web_monitoring

SERVER_PORT=3000
NODE_ENV=production

JWT_SECRET=your_jwt_secret_key_change_this
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost
```

### 3. 启动服务

```bash
docker-compose up -d
```

### 4. 查看服务状态

```bash
docker-compose ps
```

### 5. 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 6. 停止服务

```bash
docker-compose down
```

## 手动部署

### 后端部署

#### 1. 安装依赖

```bash
cd backend
npm install
```

#### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件。

#### 3. 初始化数据库

```bash
mysql -u root -p < scripts/init-db.sql
```

#### 4. 构建项目

```bash
npm run build
```

#### 5. 启动服务

```bash
npm start
```

#### 6. 使用 PM2 管理进程（推荐）

```bash
npm install -g pm2
pm2 start dist/index.js --name web-monitoring-backend
pm2 save
pm2 startup
```

### 前端部署

#### 1. 安装依赖

```bash
cd frontend
npm install
```

#### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置 API 地址：

```env
VITE_API_BASE_URL=https://your-domain.com/api
```

#### 3. 构建项目

```bash
npm run build
```

#### 4. 使用 Nginx 部署

将 `dist` 目录的内容复制到 Nginx 网站根目录：

```bash
cp -r dist/* /var/www/html/
```

配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /track {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

重启 Nginx：

```bash
sudo systemctl restart nginx
```

### SDK 部署

#### 1. 构建 SDK

```bash
cd sdk
npm install
npm run build
```

#### 2. 部署 SDK 文件

将 `dist/sdk.js` 文件部署到你的服务器，使其可以通过 URL 访问：

```bash
cp dist/sdk.js /var/www/html/sdk.js
```

用户可以通过以下方式引入：

```html
<script src="https://your-domain.com/sdk.js?key=PROJECT_KEY"></script>
```

## 环境变量配置

### 后端环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 3306 |
| DB_USERNAME | 数据库用户名 | root |
| DB_PASSWORD | 数据库密码 | - |
| DB_DATABASE | 数据库名称 | web_monitoring |
| SERVER_PORT | 服务器端口 | 3000 |
| NODE_ENV | 运行环境 | development |
| JWT_SECRET | JWT 密钥 | - |
| JWT_EXPIRES_IN | JWT 过期时间 | 7d |
| CORS_ORIGIN | CORS 允许的源 | * |

### 前端环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| VITE_API_BASE_URL | API 基础地址 | http://localhost:3000/api |

## 数据库初始化

### 使用 SQL 脚本初始化

```bash
mysql -u root -p < scripts/init-db.sql
```

### 使用 TypeORM 同步（开发环境）

在开发环境中，TypeORM 会自动创建表结构（`synchronize: true`）。

### 添加种子数据

```bash
npm run seed
```

这会创建一个管理员账号：
- 用户名：admin
- 密码：admin123456

**生产环境请务必修改默认密码！**

## 安全建议

1. 修改所有默认密码
2. 使用强密码和 JWT 密钥
3. 启用 HTTPS
4. 配置防火墙规则
5. 定期备份数据库
6. 定期更新依赖包
7. 设置适当的 CORS 策略
8. 限制数据库访问权限

## 监控和维护

### 查看日志

```bash
# Docker
docker-compose logs -f

# PM2
pm2 logs web-monitoring-backend

# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 数据库备份

```bash
mysqldump -u username -p web_monitoring > backup_$(date +%Y%m%d).sql
```

### 数据库恢复

```bash
mysql -u username -p web_monitoring < backup_20240101.sql
```

## 故障排查

### 后端无法启动

1. 检查数据库连接是否正常
2. 检查环境变量配置是否正确
3. 查看日志输出

### 前端无法访问 API

1. 检查 API 地址配置是否正确
2. 检查 CORS 配置
3. 查看浏览器控制台错误信息

### SDK 数据无法上报

1. 检查项目 Key 是否正确
2. 检查 API 地址是否可访问
3. 查看浏览器控制台网络请求
