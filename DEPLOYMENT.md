# 宝塔面板部署指南

## 部署架构

```
宝塔面板
├── 后端服务 (Node.js + PM2)
│   └── 端口: 3001
├── 前端应用 (Vite 构建的静态文件)
│   └── Nginx 静态服务
└── 插件文件 (静态资源)
    └── Nginx 静态服务
```

## 一、准备工作

### 1. 服务器要求
- 操作系统: Linux (CentOS/Ubuntu/Debian)
- 已安装宝塔面板
- Node.js 版本: >= 16.x
- Nginx 已安装

### 2. 在宝塔面板中安装必要软件
- **PM2管理器** (用于管理 Node.js 进程)
- **Nginx** (用于反向代理和静态文件服务)

## 二、部署步骤

### 步骤 1: 上传项目文件

1. 在宝塔面板中创建网站目录，例如: `/www/wwwroot/webpage-monitoring`
2. 将整个项目上传到该目录，结构如下:
   ```
   /www/wwwroot/webpage-monitoring/
   ├── backend/
   ├── frontend/
   ├── plugin/
   └── ...
   ```

### 步骤 2: 配置后端服务

#### 2.1 安装后端依赖
```bash
cd /www/wwwroot/webpage-monitoring/backend
npm install --production
```

#### 2.2 配置环境变量
创建 `/www/wwwroot/webpage-monitoring/backend/.env` 文件:
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://your-domain.com
CORS_CREDENTIALS=true
JWT_SECRET=your-super-secret-jwt-key-change-this
LOG_LEVEL=info
```

#### 2.3 使用 PM2 启动后端
在宝塔面板的 **PM2管理器** 中:
1. 点击 **添加项目**
2. 项目名称: `webpage-monitoring-backend`
3. 项目路径: `/www/wwwroot/webpage-monitoring/backend`
4. 启动文件: `src/index.js`
5. 项目端口: `3001`
6. 点击 **提交**

或者使用命令行:
```bash
cd /www/wwwroot/webpage-monitoring/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 步骤 3: 构建前端应用

#### 3.1 安装前端依赖
```bash
cd /www/wwwroot/webpage-monitoring/frontend
npm install
```

#### 3.2 配置环境变量
创建 `/www/wwwroot/webpage-monitoring/frontend/.env.production` 文件:
```env
VITE_API_BASE_URL=/api
```

#### 3.3 构建前端
```bash
cd /www/wwwroot/webpage-monitoring/frontend
npm run build
```

构建完成后，会在 `frontend/dist` 目录生成静态文件。

### 步骤 4: 配置 Nginx

#### 4.1 在宝塔面板中创建网站
1. 进入 **网站** -> **添加站点**
2. 域名: 填写你的域名 (例如: `monitoring.yourdomain.com`)
3. 根目录: `/www/wwwroot/webpage-monitoring/frontend/dist`
4. PHP版本: 纯静态
5. 点击 **提交**

#### 4.2 配置 Nginx 反向代理
在宝塔面板中:
1. 进入 **网站** -> 找到你的站点 -> **设置**
2. 点击 **配置文件** 标签
3. 将配置文件替换为以下内容（见下方配置）
4. 点击 **保存**

### 步骤 5: 配置插件访问

插件文件需要可以通过 HTTP 访问，Nginx 配置中已包含插件路径配置。

## 三、Nginx 配置

将以下配置替换到宝塔面板的网站配置文件中:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名
    
    # 前端静态文件
    root /www/wwwroot/webpage-monitoring/frontend/dist;
    index index.html;

    # 插件文件访问
    location /plugin/ {
        alias /www/wwwroot/webpage-monitoring/plugin/dist/;
        try_files $uri $uri/ =404;
        add_header Cache-Control "public, max-age=31536000";
    }

    # API 反向代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 前端路由支持 (SPA)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 日志
    access_log /www/wwwlogs/webpage-monitoring-access.log;
    error_log /www/wwwlogs/webpage-monitoring-error.log;
}
```

### 如果使用 HTTPS (推荐)

1. 在宝塔面板中申请 SSL 证书
2. 启用 **强制 HTTPS**
3. 配置会自动添加 HTTPS 支持

## 四、文件权限设置

```bash
# 设置项目目录权限
chown -R www:www /www/wwwroot/webpage-monitoring
chmod -R 755 /www/wwwroot/webpage-monitoring

# 后端数据目录需要写权限
chmod -R 755 /www/wwwroot/webpage-monitoring/backend/data
```

## 五、验证部署

### 1. 检查后端服务
```bash
# 查看 PM2 进程
pm2 list

# 查看后端日志
pm2 logs webpage-monitoring-backend

# 测试后端 API
curl http://localhost:3001/health
```

### 2. 检查前端
- 访问 `http://your-domain.com`
- 应该能看到登录页面

### 3. 检查插件
- 访问 `http://your-domain.com/plugin/monitoring.min.js`
- 应该能下载插件文件

## 六、常见问题

### 1. 后端服务无法启动
- 检查端口 3001 是否被占用
- 检查 `.env` 文件配置是否正确
- 查看 PM2 日志: `pm2 logs webpage-monitoring-backend`

### 2. API 请求失败
- 检查 Nginx 反向代理配置
- 检查后端服务是否运行: `pm2 list`
- 查看 Nginx 错误日志

### 3. 前端页面空白
- 检查前端构建是否成功
- 检查浏览器控制台错误
- 确认 API 地址配置正确

### 4. 插件无法加载
- 检查插件文件路径: `/plugin/dist/monitoring.min.js`
- 检查 Nginx 配置中的 `/plugin/` 路径
- 确认插件文件权限

## 七、更新部署

### 更新后端
```bash
cd /www/wwwroot/webpage-monitoring/backend
git pull  # 或重新上传文件
npm install --production
pm2 restart webpage-monitoring-backend
```

### 更新前端
```bash
cd /www/wwwroot/webpage-monitoring/frontend
git pull  # 或重新上传文件
npm install
npm run build
# Nginx 会自动使用新的 dist 文件
```

### 更新插件
```bash
cd /www/wwwroot/webpage-monitoring/plugin
npm run build:prod
# 新文件会自动生成到 dist/ 目录
```

## 八、性能优化建议

1. **启用 Gzip 压缩** (在宝塔面板网站设置中)
2. **配置 CDN** (可选，用于静态资源加速)
3. **数据库优化** (如果数据量大，考虑迁移到 MySQL/PostgreSQL)
4. **监控和日志** (使用宝塔面板的监控功能)

## 九、安全建议

1. **修改 JWT_SECRET** 为强密码
2. **配置防火墙** 只开放必要端口
3. **定期备份** 数据文件 (`backend/data/*.csv`)
4. **启用 HTTPS** 强制加密传输
5. **限制 API 访问** 可配置 IP 白名单

## 十、备份策略

### 自动备份 (宝塔面板)
1. 进入 **计划任务**
2. 添加备份任务:
   - 备份目录: `/www/wwwroot/webpage-monitoring/backend/data`
   - 备份周期: 每天
   - 保留份数: 7

### 手动备份
```bash
# 备份数据文件
tar -czf backup-$(date +%Y%m%d).tar.gz /www/wwwroot/webpage-monitoring/backend/data
```

