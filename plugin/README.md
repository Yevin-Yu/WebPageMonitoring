# 前端页面监控插件

这是一个轻量级的前端页面监控插件，可以嵌入到任何前端项目中，自动收集访问数据并发送到监控服务器。

## 构建

### 安装依赖（推荐）

使用 terser 可以获得更好的压缩效果：

```bash
npm install
```

如果没有安装 terser，构建脚本会使用简单的压缩方法，但压缩效果会稍差。

### 构建所有版本

```bash
npm run build
# 或者
node build.js
```

### 仅构建开发版本

```bash
npm run build:dev
# 或者
node build.js dev
```

### 仅构建生产版本

```bash
npm run build:prod
# 或者
node build.js prod
```

## 输出文件

构建完成后，会在 `dist/` 目录下生成以下文件：

- `monitoring.dev.js` - 开发版本（带注释，未压缩）
- `monitoring.min.js` - 生产版本（压缩版本，体积更小）

## 使用方式

### 开发环境

```html
<script src="dist/monitoring.dev.js"></script>
<script>
  window.WebPageMonitoring.init({
    apiUrl: 'http://localhost:3001',
    projectKey: 'your-project-key',
    autoTrack: true,
    trackPageView: true,
    trackClick: true,
    trackError: true,
    trackPerformance: true
  });
</script>
```

### 生产环境

```html
<script src="dist/monitoring.min.js"></script>
<script>
  window.WebPageMonitoring.init({
    apiUrl: 'https://your-api-domain.com',
    projectKey: 'your-project-key',
    autoTrack: true,
    trackPageView: true,
    trackClick: true,
    trackError: true,
    trackPerformance: true
  });
</script>
```

## 配置选项

- `apiUrl` (必需) - 监控服务器地址
- `projectKey` (必需) - 项目唯一标识
- `autoTrack` (可选) - 是否自动追踪，默认 `true`
- `trackPageView` (可选) - 是否追踪页面访问，默认 `true`
- `trackClick` (可选) - 是否追踪点击事件，默认 `true`
- `trackError` (可选) - 是否追踪错误，默认 `true`
- `trackPerformance` (可选) - 是否追踪性能数据，默认 `true`
- `batchSize` (可选) - 批量发送大小，默认 `10`
- `flushInterval` (可选) - 批量发送间隔（毫秒），默认 `5000`
- `debug` (可选) - 是否开启调试模式，默认 `false`

## API

### init(options)

初始化监控插件

```javascript
window.WebPageMonitoring.init({
  apiUrl: 'http://localhost:3001',
  projectKey: 'your-project-key'
});
```

### track(type, data)

手动追踪事件

```javascript
window.WebPageMonitoring.track('custom', {
  category: 'button',
  action: 'click',
  label: 'submit'
});
```

### trackPageView()

手动追踪页面访问

```javascript
window.WebPageMonitoring.trackPageView();
```

