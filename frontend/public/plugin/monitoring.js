/**
 * 前端页面监控插件
 * 可以嵌入到任何前端项目中，自动收集访问数据并发送到监控服务器
 */
(function (window) {
    'use strict';

    // 配置对象
    const config = {
        apiUrl: '', // 监控服务器地址，由用户配置
        projectKey: '', // 项目唯一标识
        autoTrack: true, // 是否自动追踪
        trackPageView: true, // 是否追踪页面访问
        trackClick: true, // 是否追踪点击事件
        trackError: true, // 是否追踪错误
        trackPerformance: true, // 是否追踪性能数据
        batchSize: 10, // 批量发送大小
        flushInterval: 5000, // 批量发送间隔（毫秒）
    };

    // 数据队列
    let dataQueue = [];
    let timer = null;

    /**
     * 获取用户信息
     */
    function getUserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            referrer: document.referrer,
        };
    }

    /**
     * 获取页面信息
     */
    function getPageInfo() {
        return {
            url: window.location.href,
            path: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            title: document.title,
            host: window.location.host,
            hostname: window.location.hostname,
            protocol: window.location.protocol,
        };
    }

    /**
     * 获取 IP 地址（通过第三方服务）
     */
    function getIPAddress(callback) {
        // 使用免费的 IP 查询服务
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => callback(data.ip))
            .catch(() => callback('unknown'));
    }

    /**
     * 获取性能数据
     */
    function getPerformanceData() {
        if (!window.performance || !window.performance.timing) {
            return null;
        }

        const timing = window.performance.timing;
        const navigation = window.performance.navigation;

        return {
            dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
            tcpTime: timing.connectEnd - timing.connectStart,
            requestTime: timing.responseStart - timing.requestStart,
            responseTime: timing.responseEnd - timing.responseStart,
            domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadTime: timing.loadEventEnd - timing.navigationStart,
            redirectTime: timing.redirectEnd - timing.redirectStart,
            type: navigation.type,
        };
    }

    /**
     * 创建监控数据对象
     */
    function createEvent(type, data = {}) {
        const event = {
            type: type,
            projectKey: config.projectKey,
            timestamp: new Date().toISOString(),
            page: getPageInfo(),
            user: getUserInfo(),
            data: data,
        };

        // 异步获取 IP（不阻塞主流程）
        getIPAddress((ip) => {
            event.user.ip = ip;
        });

        return event;
    }

  /**
   * 发送数据到服务器
   */
  function sendData(events) {
    if (!config.apiUrl || !config.projectKey) {
      console.warn('监控插件未正确配置 apiUrl 或 projectKey');
      return;
    }

    const payload = {
      projectKey: config.projectKey,
      events: events,
    };

    // 优先使用 fetch，避免被广告拦截器拦截
    // 使用 text/plain 作为 Content-Type 可以降低被拦截的概率
    const url = config.apiUrl + '/api/events';
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
      mode: 'cors',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // 数据发送成功
      if (config.debug) {
        console.log('监控数据发送成功:', data);
      }
    })
    .catch((error) => {
      // 如果是被客户端拦截的错误，提供更友好的提示
      if (error.message && error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        console.warn('监控数据发送被浏览器扩展拦截，请检查广告拦截器设置');
      } else {
        console.error('监控数据发送失败:', error);
      }
    });
  }

    /**
     * 批量发送数据
     */
    function flush() {
        if (dataQueue.length === 0) return;

        const events = dataQueue.splice(0, config.batchSize);
        sendData(events);

        if (dataQueue.length > 0 && timer === null) {
            timer = setTimeout(flush, config.flushInterval);
        } else if (dataQueue.length === 0) {
            timer = null;
        }
    }

    /**
     * 添加事件到队列
     */
    function track(type, data = {}) {
        if (!config.autoTrack && type !== 'pageview') return;

        const event = createEvent(type, data);
        dataQueue.push(event);

        // 如果队列达到批量大小，立即发送
        if (dataQueue.length >= config.batchSize) {
            flush();
        } else if (timer === null) {
            timer = setTimeout(flush, config.flushInterval);
        }
    }

    /**
     * 追踪页面访问
     */
    function trackPageView() {
        if (!config.trackPageView) return;

        const performanceData = config.trackPerformance ? getPerformanceData() : null;
        track('pageview', { performance: performanceData });
    }

    /**
     * 追踪点击事件
     */
    function trackClick(event) {
        if (!config.trackClick) return;

        const target = event.target;
        track('click', {
            element: target.tagName,
            id: target.id || '',
            className: target.className || '',
            text: target.textContent?.substring(0, 50) || '',
            x: event.clientX,
            y: event.clientY,
        });
    }

    /**
     * 追踪错误
     */
    function trackError(error, source, lineno, colno) {
        if (!config.trackError) return;

        track('error', {
            message: error.message || error,
            source: source || '',
            lineno: lineno || 0,
            colno: colno || 0,
            stack: error.stack || '',
        });
    }

    /**
     * 初始化监控
     */
    function init(options = {}) {
        // 合并配置
        Object.assign(config, options);

        if (!config.apiUrl || !config.projectKey) {
            console.error('监控插件初始化失败: 缺少 apiUrl 或 projectKey');
            return;
        }

        // 追踪页面访问
        if (config.trackPageView) {
            trackPageView();

            // 监听路由变化（适用于 SPA）
            let lastUrl = window.location.href;
            const observer = new MutationObserver(() => {
                const currentUrl = window.location.href;
                if (currentUrl !== lastUrl) {
                    lastUrl = currentUrl;
                    setTimeout(trackPageView, 0);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });

            // 监听 popstate 事件（浏览器前进后退）
            window.addEventListener('popstate', trackPageView);
        }

        // 追踪点击事件
        if (config.trackClick) {
            document.addEventListener('click', trackClick, true);
        }

        // 追踪 JavaScript 错误
        if (config.trackError) {
            window.addEventListener('error', (event) => {
                trackError(event.error || event.message, event.filename, event.lineno, event.colno);
            }, true);

            // 追踪 Promise 未捕获的错误
            window.addEventListener('unhandledrejection', (event) => {
                trackError(event.reason, 'unhandledrejection', 0, 0);
            });
        }

        // 页面卸载时发送剩余数据
        window.addEventListener('beforeunload', () => {
            if (dataQueue.length > 0) {
                flush();
            }
        });

        // 页面隐藏时发送数据
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && dataQueue.length > 0) {
                flush();
            }
        });
    }

    // 暴露 API
    window.WebPageMonitoring = {
        init: init,
        track: track,
        trackPageView: trackPageView,
        config: config,
    };

})(window);

