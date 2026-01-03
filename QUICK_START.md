# 宝塔面板快速部署指南

## 一、准备工作 (5分钟)

### 1. 在宝塔面板中安装软件
- **PM2管理器** (应用商店搜索安装)
- **Nginx** (通常已安装)

### 2. 创建网站目录
在服务器上创建目录:
```bash
mkdir -p /www/wwwroot/webpage-monitoring
```

## 二、上传项目文件 (10分钟)

### 方式一: 使用宝塔面板文件管理器
1. 进入 **文件** 管理
2. 进入 `/www/wwwroot/webpage-monitoring`
3. 上传项目压缩包并解压

### 方式二: 使用 Git (推荐)
```bash
cd /www/wwwroot/webpage-monitoring
git clone your-repo-url .
```

### 方式三: 使用 SFTP
使用 FileZilla 等工具上传整个项目文件夹

## 三、配置后端 (5分钟)

### 1. 安装依赖
在宝塔面板 **终端** 中执行:
```bash
cd /www/wwwroot/webpage-monitoring/backend
npm install --production
```

### 2. 创建环境变量文件
在宝塔面板 **文件** 管理中:
1. 进入 `backend` 目录
2. 复制 `.env.example` 为 `.env`
3. 编辑 `.env`，修改以下配置:
   ```env
   PORT=3002
   NODE_ENV=production
   CORS_ORIGIN=http://your-domain.com  # 改为你的域名
   JWT_SECRET=your-very-secret-key-here  # 改为随机字符串
   ```

### 3. 启动后端服务
在宝塔面板 **PM2管理器** 中:
1. 点击 **添加项目**
2. 填写信息:
   - 项目名称: `webpage-monitoring-backend`
   - 项目路径: `/www/wwwroot/webpage-monitoring/backend`
   - 启动文件: `src/index.js`
   - 项目端口: `3002`
3. 点击 **提交**

## 四、构建前端 (5分钟)

### 1. 安装依赖
```bash
cd /www/wwwroot/webpage-monitoring/frontend
npm install
```

### 2. 创建生产环境变量
在 `frontend` 目录创建 `.env.production`:
```env
VITE_API_BASE_URL=/api
```

### 3. 构建前端
```bash
npm run build
```

## 五、构建插件 (2分钟)

```bash
cd /www/wwwroot/webpage-monitoring/plugin
npm install
npm run build:prod
```

## 六、配置 Nginx (5分钟)

### 1. 在宝塔面板创建网站
1. 进入 **网站** -> **添加站点**
2. 填写域名 (例如: `monitoring.example.com`)
3. 根目录: `/www/wwwroot/webpage-monitoring/frontend/dist`
4. PHP版本: **纯静态**
5. 点击 **提交**

### 2. 配置 Nginx
1. 进入网站 **设置** -> **配置文件**
2. 将配置替换为 `nginx.conf.example` 中的内容
3. 修改 `server_name` 为你的域名
4. 点击 **保存**
5. 点击 **重载配置**

## 七、设置文件权限 (2分钟)

在宝塔面板 **终端** 执行:
```bash
chown -R www:www /www/wwwroot/webpage-monitoring
chmod -R 755 /www/wwwroot/webpage-monitoring
chmod -R 755 /www/wwwroot/webpage-monitoring/backend/data
```

## 八、验证部署 (3分钟)

### 1. 检查后端
- 在 PM2管理器 中查看状态应为 **运行中**
- 点击 **日志** 查看是否有错误

### 2. 访问网站
- 打开浏览器访问你的域名
- 应该能看到登录页面

### 3. 测试插件
- 访问: `http://your-domain.com/plugin/monitoring.min.js`
- 应该能下载文件

## 九、使用一键部署脚本 (可选)

如果你熟悉命令行，可以使用提供的部署脚本:

```bash
cd /www/wwwroot/webpage-monitoring
chmod +x deploy.sh
bash deploy.sh
```

脚本会自动完成:
- 安装依赖
- 构建前端和插件
- 启动后端服务
- 设置文件权限

## 常见问题

### Q: 后端服务启动失败？
A: 检查:
1. `.env` 文件是否存在且配置正确
2. 端口 3002 是否被占用
3. 查看 PM2 日志

### Q: 前端页面空白？
A: 检查:
1. 前端是否构建成功 (`frontend/dist` 目录是否存在)
2. Nginx 配置中的 `root` 路径是否正确
3. 浏览器控制台是否有错误

### Q: API 请求 404？
A: 检查:
1. Nginx 配置中的 `/api/` 代理是否正确（应代理到 `http://127.0.0.1:3002`）
2. 后端服务是否运行: `pm2 list`
3. 后端端口是否为 3002
4. 插件中的 apiUrl 是否正确：
   - 生产环境应使用同域地址（如 `http://your-domain.com`），无需端口号
   - 开发环境可使用 `http://localhost:3002`

### Q: 插件无法加载？
A: 检查:
1. 插件是否构建: `plugin/dist/monitoring.min.js` 是否存在
2. Nginx 配置中的 `/plugin/` 路径是否正确
3. 文件权限是否正确

## 下一步

部署成功后:
1. 访问网站注册账号
2. 创建项目
3. 获取嵌入代码
4. 在目标网站中嵌入监控代码

详细配置请参考 `DEPLOYMENT.md`

