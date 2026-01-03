# 本地测试指南

## 快速开始

### 1. 启动后端服务

```bash
cd backend
npm install
npm start
```

后端服务将运行在 `http://localhost:3002`

### 2. 启动前端面板（可选）

如果需要查看数据，可以启动前端面板：

```bash
cd frontend
npm install
npm run dev
```

前端面板将运行在 `http://localhost:5173`（或 Vite 分配的端口）

### 3. 创建测试项目

1. 访问前端面板（如果已启动）
2. 登录系统
3. 创建一个新项目
4. 复制项目的 Key

### 4. 配置测试页面

打开 `plugin/example.local.html` 文件，修改以下内容：

```javascript
// 找到这一行，替换为你的项目 Key
projectKey: 'test-project-key',  // ⚠️ 替换为你的实际项目 Key
```

### 5. 运行测试页面

有几种方式可以打开测试页面：

#### 方式一：使用本地文件服务器（推荐）

```bash
# 在 plugin 目录下
cd plugin

# 使用 Python 3
python3 -m http.server 8080

# 或使用 Python 2
python -m SimpleHTTPServer 8080

# 或使用 Node.js http-server
npx http-server -p 8080
```

然后访问：`http://localhost:8080/example.local.html`

#### 方式二：直接在浏览器打开

直接双击 `example.local.html` 文件，但需要注意：
- 某些浏览器可能限制本地文件的跨域请求
- 如果遇到 CORS 错误，请使用方式一

#### 方式三：使用 VSCode Live Server

如果使用 VSCode：
1. 安装 "Live Server" 扩展
2. 右键点击 `example.local.html`
3. 选择 "Open with Live Server"

### 6. 测试功能

打开测试页面后：

1. **检查插件状态**：页面顶部会显示插件加载状态
2. **打开浏览器控制台**（F12）：查看日志和网络请求
3. **点击测试按钮**：
   - 测试点击事件
   - 测试错误捕获
   - 测试自定义事件
   - 手动触发页面访问
   - 查看性能数据

### 7. 查看数据

1. 访问前端面板：`http://localhost:5173`
2. 进入"项目监控"页面
3. 选择对应的项目
4. 查看各个标签页的数据：
   - **数据概览**：统计数据和图表
   - **事件列表**：所有收集的事件
   - **实时监控**：实时数据更新

## 常见问题

### Q: 插件加载失败？

**检查：**
1. `monitoring.js` 文件是否在 `plugin` 目录下
2. 浏览器控制台是否有 404 错误
3. 文件路径是否正确（`script.src`）

**解决：**
- 如果使用 `dist/monitoring.dev.js`，修改 `script.src` 为 `./dist/monitoring.dev.js`
- 确保使用本地文件服务器，而不是直接打开文件

### Q: 数据未发送到服务器？

**检查：**
1. 后端服务是否运行在 `http://localhost:3002`
2. 浏览器控制台的网络请求（Network 标签）
3. 是否有 CORS 错误

**解决：**
- 确认后端服务正在运行
- 检查后端 `CORS` 配置是否允许本地请求
- 查看后端控制台的日志

### Q: CORS 错误？

**错误信息：**
```
Access to XMLHttpRequest at 'http://localhost:3002/api/events' 
from origin 'null' has been blocked by CORS policy
```

**解决：**
1. 使用本地文件服务器（不要直接打开 HTML 文件）
2. 检查后端 `backend/src/config/index.js` 中的 CORS 配置
3. 开发环境应该允许所有来源：`origin: '*'`

### Q: 项目 Key 错误？

**检查：**
1. 是否在前端面板创建了项目
2. `projectKey` 是否正确复制
3. 后端是否有该项目的记录

**解决：**
- 重新创建项目并复制 Key
- 检查 `backend/data/projects.csv` 文件，确认项目存在

### Q: 如何查看发送的数据？

**方法：**
1. 打开浏览器控制台（F12）
2. 切换到 "Network"（网络）标签
3. 筛选 "XHR" 或 "Fetch" 请求
4. 查找发送到 `/api/events` 的请求
5. 点击请求查看请求体和响应

## 测试清单

- [ ] 后端服务运行正常
- [ ] 前端面板可以访问（可选）
- [ ] 已创建测试项目并获取 Key
- [ ] 修改了 `example.local.html` 中的 `projectKey`
- [ ] 使用本地文件服务器打开测试页面
- [ ] 插件状态显示为"成功"
- [ ] 浏览器控制台无错误
- [ ] 点击测试按钮后，网络请求正常发送
- [ ] 前端面板可以查看到数据

## 下一步

测试成功后，你可以：

1. **集成到实际项目**：将监控插件代码集成到你的网站中
2. **自定义配置**：根据需求调整插件配置
3. **部署到生产环境**：参考 `QUICK_START.md` 进行部署

## 相关文件

- `example.local.html` - 本地测试页面
- `example.html` - 生产环境示例页面
- `monitoring.js` - 监控插件源码
- `dist/monitoring.dev.js` - 开发版本（带注释）
- `dist/monitoring.min.js` - 生产版本（压缩）

