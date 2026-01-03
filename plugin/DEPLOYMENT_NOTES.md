# 插件部署配置说明

## API URL 配置

### 开发环境
```javascript
window.WebPageMonitoring.init({
  apiUrl: 'http://localhost:3002',  // 直接访问后端端口
  projectKey: 'your-project-key'
});
```

### 生产环境（宝塔面板部署）

#### 方式一：前后端同域（推荐）
如果前端和 API 在同一域名下，使用同域地址：

```javascript
window.WebPageMonitoring.init({
  apiUrl: 'http://your-domain.com',  // 或 https://your-domain.com
  projectKey: 'your-project-key'
});
```

**工作原理：**
- 插件会将请求发送到: `http://your-domain.com/api/events`
- Nginx 反向代理会将 `/api/` 路径转发到后端 `http://127.0.0.1:3002`
- 无需暴露后端端口，更安全

#### 方式二：前后端不同域
如果 API 使用独立域名或端口：

```javascript
window.WebPageMonitoring.init({
  apiUrl: 'http://api.your-domain.com',  // 或带端口 http://your-domain.com:3002
  projectKey: 'your-project-key'
});
```

**注意：** 需要配置 CORS 允许跨域访问。

## 插件文件路径

### 开发环境
```html
<script src="http://localhost:3000/plugin/monitoring.js"></script>
```

### 生产环境
```html
<!-- 同域访问（推荐） -->
<script src="http://your-domain.com/plugin/monitoring.js"></script>

<!-- 或使用 CDN -->
<script src="https://cdn.your-domain.com/plugin/monitoring.min.js"></script>
```

## 完整示例

### 生产环境完整代码
```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'http://your-domain.com/plugin/monitoring.min.js';
    script.onload = function() {
      window.WebPageMonitoring.init({
        apiUrl: 'http://your-domain.com',  // 同域地址，无需端口
        projectKey: 'your-project-key',
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

## 验证配置

部署后，可以通过以下方式验证：

1. **检查插件加载**
   - 打开浏览器控制台
   - 查看 Network 标签，确认 `monitoring.min.js` 加载成功

2. **检查 API 请求**
   - 在 Network 标签中查找 `/api/events` 请求
   - 确认请求地址正确（生产环境应为同域地址）
   - 确认请求状态为 200

3. **检查数据收集**
   - 访问嵌入插件的页面
   - 在前端面板查看是否有数据上报

## 常见问题

### Q: 插件加载失败？
A: 检查：
- 插件文件路径是否正确
- Nginx 配置中的 `/plugin/` 路径是否正确
- 文件权限是否正确

### Q: API 请求失败？
A: 检查：
- apiUrl 配置是否正确
- Nginx 反向代理配置是否正确
- 后端服务是否运行
- CORS 配置是否正确（如果跨域）

### Q: 生产环境应该使用哪个文件？
A: 
- **开发版本**: `monitoring.dev.js` - 带注释，便于调试
- **生产版本**: `monitoring.min.js` - 压缩版本，体积更小（推荐）

