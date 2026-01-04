# Web Monitoring SDK

轻量级前端数据采集 SDK，用于收集用户访问和性能数据。

## 特性

- 🚀 轻量级，无依赖
- 📊 自动收集页面访问数据
- ⚡ 性能监控（加载时间、资源性能）
- 🐛 错误监控
- 🎯 支持 SPA 应用
- 🔒 隐私友好

## 使用方法

### 方式一：通过 script 标签引入

```html
<script src="https://your-domain.com/sdk.js?key=YOUR_PROJECT_KEY"></script>
```

### 方式二：作为 npm 包使用

```bash
npm install web-monitoring-sdk
```

```typescript
import WebMonitoring from 'web-monitoring-sdk';

const sdk = new WebMonitoring({
  key: 'YOUR_PROJECT_KEY',
  apiUrl: 'https://your-domain.com/track',
  autoTrack: true,        // 自动追踪页面浏览
  trackPerformance: true, // 追踪性能数据
});

sdk.init();
```

## 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| key | string | 必填 | 项目唯一标识 |
| apiUrl | string | /track | API 地址 |
| autoTrack | boolean | true | 是否自动追踪页面浏览 |
| trackPerformance | boolean | true | 是否追踪性能数据 |

## 收集的数据

### 页面访问数据
- Session ID
- 页面 URL 和标题
- 来源页面
- 用户代理
- 屏幕信息（分辨率、色深）
- 浏览器信息
- 操作系统信息

### 性能数据
- 页面加载时间
- DOM 内容加载时间
- 首次绘制时间 (FP)
- 首次内容绘制时间 (FCP)
- 资源加载信息
- 错误信息

## API

### init()
初始化 SDK。

```typescript
sdk.init();
```

### trackEvent(eventName, properties)
追踪自定义事件。

```typescript
sdk.trackEvent('button_click', {
  button_id: 'submit',
  page: '/contact'
});
```

### getSessionId()
获取当前会话 ID。

```typescript
const sessionId = sdk.getSessionId();
```

## 示例

查看 `examples/` 目录获取完整的使用示例。
