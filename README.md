# 前端页面监控工具

一个完整的前端页面监控解决方案，包含可嵌入的监控插件、后端 API 服务和前端展示面板。

## 项目结构

```
WebPageMonitoring/
├── plugin/              # 可嵌入的监控插件
│   └── monitoring.js    # 监控 SDK
├── frontend/           # 前端监控展示面板
│   ├── src/
│   │   ├── components/ # React 组件
│   │   ├── App.jsx     # 主应用
│   │   └── main.jsx    # 入口文件
│   ├── package.json
│   └── vite.config.js
├── backend/            # 后端 API 服务
│   ├── src/
│   │   ├── index.js    # Express 服务器
│   │   └── database.js # CSV 文件操作
│   ├── data/           # CSV 数据文件存储目录
│   │   ├── projects.csv # 项目数据
│   │   └── events.csv   # 事件数据
│   └── package.json
└── README.md
```

## 功能特性

### 1. 监控插件 (Plugin)
- 自动追踪页面访问
- 追踪用户点击事件
- 捕获 JavaScript 错误
- 收集性能数据
- 获取用户 IP、User Agent、屏幕信息等
- 批量发送数据，减少服务器压力

### 2. 后端服务 (Backend)
- RESTful API 接口
- CSV 文件存储（无需数据库）
- 项目管理和事件存储
- 数据统计和查询接口

### 3. 前端面板 (Frontend)
- 项目管理（创建、查看项目）
- 实时数据展示
- 事件列表查看
- 数据统计和可视化
- 热门页面分析

## 快速开始

### 1. 安装依赖

#### 后端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 2. 启动服务

#### 启动后端服务
```bash
cd backend
npm start
# 或开发模式
npm run dev
```

后端服务默认运行在 `http://localhost:3001`

#### 启动前端服务
```bash
cd frontend
npm run dev
```

前端服务默认运行在 `http://localhost:3000`

### 3. 使用监控插件

1. 访问前端面板 `http://localhost:3000`
2. 创建一个新项目，获取项目 Key
3. 在项目详情页面复制嵌入代码
4. 将代码添加到你的网站 HTML 中（通常在 `</head>` 之前）

示例：
```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'http://localhost:3000/plugin/monitoring.js';
    script.onload = function() {
      window.WebPageMonitoring.init({
        apiUrl: 'http://localhost:3001',
        projectKey: '你的项目Key',
        autoTrack: true,
        trackPageView: true,
        trackClick: true,
        trackError: true,
        trackPerformance: true
      });
    };
    document.head.appendChild(script);
  })();
</script>
```

## API 接口

### 项目管理

#### 创建项目
```
POST /api/projects
Content-Type: application/json

{
  "name": "项目名称",
  "description": "项目描述"
}
```

#### 获取项目列表
```
GET /api/projects
```

### 事件数据

#### 接收事件（由插件调用）
```
POST /api/events
Content-Type: application/json

{
  "projectKey": "项目Key",
  "events": [...]
}
```

#### 获取事件列表
```
GET /api/events?projectKey=xxx&type=pageview&page=1&pageSize=50
```

#### 获取项目统计
```
GET /api/projects/:projectKey/stats?startTime=xxx&endTime=xxx
```

#### 获取事件统计
```
GET /api/events/stats?projectKey=xxx&startTime=xxx&endTime=xxx
```

## 配置说明

### 监控插件配置

```javascript
window.WebPageMonitoring.init({
  apiUrl: 'http://localhost:3001',  // 后端 API 地址
  projectKey: 'your-project-key',    // 项目唯一标识
  autoTrack: true,                   // 是否自动追踪
  trackPageView: true,               // 是否追踪页面访问
  trackClick: true,                  // 是否追踪点击事件
  trackError: true,                   // 是否追踪错误
  trackPerformance: true,             // 是否追踪性能数据
  batchSize: 10,                     // 批量发送大小
  flushInterval: 5000,               // 批量发送间隔（毫秒）
});
```

### 环境变量

后端可以通过环境变量配置：

- `PORT`: 服务器端口（默认: 3001）

## 数据收集内容

监控插件会自动收集以下信息：

- **页面信息**: URL、路径、标题、主机等
- **用户信息**: IP 地址、User Agent、语言、平台、屏幕尺寸等
- **事件数据**: 事件类型、时间戳、自定义数据等
- **性能数据**: DNS 时间、TCP 时间、页面加载时间等（可选）

## 注意事项

1. **跨域问题**: 确保后端服务配置了 CORS，允许前端域名访问
2. **IP 获取**: 插件使用第三方服务获取 IP，可能需要处理跨域问题
3. **数据隐私**: 请遵守相关隐私法规，告知用户数据收集情况
4. **生产环境**: 部署到生产环境时，请修改 API 地址和项目 Key

## 开发说明

### 技术栈

- **后端**: Node.js + Express + CSV 文件存储
- **前端**: React + Vite
- **插件**: 纯 JavaScript（无依赖）

### 数据存储

使用 CSV 文件存储数据，无需数据库，数据文件存储在 `backend/data/` 目录：

- `projects.csv`: 项目数据（包含项目 ID、Key、名称、描述等）
- `events.csv`: 事件数据（包含所有监控事件信息）

CSV 文件会在首次运行时自动创建，数据以追加方式写入，便于查看和分析。

## 许可证

MIT

