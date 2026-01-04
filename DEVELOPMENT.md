# 开发指南

本文档提供了 Web Page Monitoring 项目的开发指南。

## 目录

- [开发环境搭建](#开发环境搭建)
- [项目结构](#项目结构)
- [开发规范](#开发规范)
- [测试](#测试)
- [常见问题](#常见问题)

## 开发环境搭建

### 环境要求

- Node.js >= 16.x
- MySQL >= 8.0
- npm 或 yarn

### 安装依赖

```bash
# 安装所有子项目的依赖
npm run install:all

# 或者分别安装
npm run install:backend
npm run install:frontend
npm run install:sdk
```

### 配置数据库

#### 使用 Docker（推荐）

```bash
docker run -d \
  --name web-monitoring-mysql \
  -e MYSQL_ROOT_PASSWORD=root123456 \
  -e MYSQL_DATABASE=web_monitoring \
  -p 3306:3306 \
  mysql:8.0
```

#### 使用本地 MySQL

创建数据库：

```sql
CREATE DATABASE web_monitoring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 配置环境变量

```bash
# 后端
cd backend
cp .env.example .env
# 编辑 .env 文件

# 前端
cd ../frontend
cp .env.example .env
# 编辑 .env 文件
```

### 启动开发服务器

```bash
# 启动后端（终端 1）
npm run dev:backend

# 启动前端（终端 2）
npm run dev:frontend

# 构建 SDK（终端 3）
cd sdk
npm run dev
```

## 项目结构

```
web-page-monitoring/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── entities/       # 数据模型
│   │   ├── controllers/    # 控制器
│   │   ├── routes/         # 路由
│   │   ├── middlewares/    # 中间件
│   │   ├── utils/          # 工具函数
│   │   ├── app.ts          # Express 应用
│   │   └── index.ts        # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # 前端管理系统
│   ├── src/
│   │   ├── api/           # API 请求
│   │   ├── components/    # 组件
│   │   ├── views/         # 页面
│   │   ├── router/        # 路由
│   │   ├── store/         # 状态管理
│   │   ├── styles/        # 样式
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── sdk/                    # 数据采集 SDK
│   ├── src/
│   │   └── sdk.ts
│   ├── package.json
│   └── vite.config.ts
├── scripts/                # 脚本文件
│   ├── init-db.sql        # 数据库初始化
│   └── seed.ts            # 种子数据
├── docker-compose.yml      # Docker 配置
└── README.md
```

## 开发规范

### 代码风格

- 使用 TypeScript 进行类型定义
- 遵循 ESLint 规则（待添加）
- 使用 Prettier 格式化代码（待添加）

### Git 提交规范

使用约定式提交：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）：
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具变动

示例：

```
feat(auth): add user registration feature

Implement user registration with email verification.

Closes #123
```

### API 设计规范

#### RESTful API 设计

- 使用名词复数形式：`/api/projects`
- 使用 HTTP 方法：GET、POST、PUT、DELETE
- 统一的响应格式：

```typescript
{
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}
```

#### 错误处理

- 使用适当的 HTTP 状态码
- 返回清晰的错误信息

### 数据库设计规范

- 表名使用复数形式、蛇形命名：`page_visits`
- 字段名使用蛇形命名：`created_at`
- 必须包含 `created_at` 和 `updated_at` 字段
- 使用外键约束
- 添加适当的索引

## 测试

### 后端测试

```bash
cd backend
npm test
```

### 前端测试

```bash
cd frontend
npm test
```

## 常见问题

### 后端问题

**Q: TypeORM 无法连接数据库**

A: 检查 `.env` 文件中的数据库配置，确保数据库已启动。

**Q: JWT 验证失败**

A: 检查 `JWT_SECRET` 是否一致，确保 token 未过期。

### 前端问题

**Q: API 请求失败**

A: 检查 `VITE_API_BASE_URL` 配置，确保后端服务已启动。

**Q: 页面空白**

A: 打开浏览器控制台查看错误信息，检查依赖是否正确安装。

### SDK 问题

**Q: 数据无法上报**

A: 检查项目 Key 是否正确，使用浏览器开发者工具查看网络请求。

## 开发工具推荐

- IDE: VS Code
- API 测试: Postman, Insomnia
- 数据库管理: MySQL Workbench, DBeaver
- Git 客户端: GitKraken, SourceTree

## 扩展开发

### 添加新的 API 端点

1. 在 `backend/src/entities/` 创建数据模型
2. 在 `backend/src/controllers/` 创建控制器
3. 在 `backend/src/routes/` 添加路由
4. 在 `frontend/src/api/` 添加 API 调用

### 添加新的前端页面

1. 在 `frontend/src/views/` 创建页面组件
2. 在 `frontend/src/router/` 添加路由配置
3. 在侧边栏菜单中添加入口

### 扩展 SDK 功能

1. 在 `sdk/src/sdk.ts` 中添加新方法
2. 更新 SDK 文档
3. 提供使用示例
