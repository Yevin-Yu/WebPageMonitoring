# Web Monitoring Backend

后端服务，提供 API 接口和数据存储。

## 技术栈

- Express.js
- TypeORM
- MySQL
- TypeScript
- JWT

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 生产环境

```bash
npm start
```

## API 文档

### 认证接口

- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- GET /api/auth/me - 获取当前用户信息
- PUT /api/auth/profile - 更新用户信息
- PUT /api/auth/password - 修改密码

### 项目管理接口

- POST /api/projects - 创建项目
- GET /api/projects - 获取项目列表
- GET /api/projects/:id - 获取项目详情
- PUT /api/projects/:id - 更新项目
- DELETE /api/projects/:id - 删除项目
- GET /api/projects/:id/stats - 获取项目统计

### 数据收集接口

- POST /api/track/pageview?key=xxx - 记录页面访问
- POST /api/track/performance?key=xxx - 记录性能数据

### 统计分析接口

- GET /api/stats/dashboard/:projectId - 获取仪表盘数据
- GET /api/stats/pages/:projectId - 获取页面统计
- GET /api/stats/performance/:projectId - 获取性能统计
- GET /api/stats/visitors/:projectId - 获取访客统计
