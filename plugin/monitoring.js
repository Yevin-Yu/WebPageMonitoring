/**
 * 前端统计插件
 * 可嵌入到任何前端项目中，自动收集页面访问数据并发送到监控服务器
 *
 * @version 2.1.0
 *
 * 使用方式：
 *
 * 1. 使用 data 属性（推荐）：
 * <script src="/plugin/monitoring.js" data-project-key="项目Key" async></script>
 *
 * 2. 使用 data 属性指定 API（可选）：
 * <script src="/plugin/monitoring.js" data-project-key="项目Key" data-api-url="API地址" async></script>
 *
 * 3. 使用 URL 参数（向后兼容）：
 * <script src="/plugin/monitoring.js?key=项目Key&apiUrl=API地址" async></script>
 *
 * 示例：
 * <script src="https://example.com/plugin/monitoring.js" data-project-key="123123" async></script>
 */
(function (window) {
    'use strict';

    /**
     * 从URL中获取指定参数的值
     * @param {string} name - 参数名
     * @param {string} url - URL字符串
     * @returns {string|null} 参数值
     */
    function getUrlParam(name, url) {
        try {
            const urlObj = new URL(url);
            const value = urlObj.searchParams.get(name);
            if (value) {
                return decodeURIComponent(value);
            }
        } catch (e) {
            // URL解析失败，尝试简单的字符串匹配
            const regex = new RegExp('[?&]' + name + '=([^&]*)', 'i');
            const match = url.match(regex);
            if (match && match[1]) {
                return decodeURIComponent(match[1]);
            }
        }
        return null;
    }

    /**
     * 从 script 标签中获取配置
     * 支持从 src 的 URL 参数和 data-* 属性获取配置
     * @returns {Object} 配置对象
     */
    function getConfigFromScript() {
        const scriptConfig = {};

        // 查找所有包含 monitoring.js 的 script 标签
        const scripts = document.querySelectorAll('script[src*="monitoring.js"]');

        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            const src = script.getAttribute('src');

            // 优先从 data-* 属性获取配置
            const dataProjectKey = script.getAttribute('data-project-key');
            if (dataProjectKey && !scriptConfig.projectKey) {
                scriptConfig.projectKey = dataProjectKey;
            }

            const dataApiUrl = script.getAttribute('data-api-url');
            if (dataApiUrl && !scriptConfig.apiUrl) {
                scriptConfig.apiUrl = dataApiUrl;
            }

            // 如果有 src，从 URL 参数获取配置（作为备选）
            if (src) {
                const projectKey = getUrlParam('key', src) || getUrlParam('projectKey', src);
                if (projectKey && !scriptConfig.projectKey) {
                    scriptConfig.projectKey = projectKey;
                }

                const apiUrl = getUrlParam('apiUrl', src);
                if (apiUrl && !scriptConfig.apiUrl) {
                    scriptConfig.apiUrl = apiUrl;
                }
            }

            // 如果已经找到所有需要的参数，可以提前退出
            if (scriptConfig.projectKey && scriptConfig.apiUrl) {
                break;
            }
        }

        return scriptConfig;
    }

    /**
     * 从 URL 参数中获取配置（已废弃，保留向后兼容）
     * @returns {Object} 配置对象
     */
    function getConfigFromUrl() {
        return getConfigFromScript();
    }

    const config = {
        apiUrl: '',
        projectKey: '',
        autoTrack: true,
        trackPageView: true,
        trackClick: false,
        trackError: false,
        trackPerformance: false,
        batchSize: 10,
        flushInterval: 5000,
    };

    // 数据队列
    let dataQueue = [];
    let timer = null;

    // 会话管理
    let sessionId = null;
    let sessionStartTime = null;
    let sessionPageCount = 0;
    let entryPage = null;
    let visitorId = null;

    /**
     * 生成或获取访客标识码
     * 优先使用 localStorage，不可用时使用 sessionStorage，最后生成临时 ID
     * @returns {string} 访客标识码
     */
    function getVisitorId() {
        if (visitorId) {
            return visitorId;
        }

        const storageKey = 'wpm_visitor_id';
        try {
            visitorId = localStorage.getItem(storageKey);
            if (!visitorId) {
                // 生成唯一ID：时间戳 + 随机数
                visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
                localStorage.setItem(storageKey, visitorId);
            }
        } catch (e) {
            // localStorage不可用时，使用sessionStorage
            try {
                visitorId = sessionStorage.getItem(storageKey);
                if (!visitorId) {
                    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
                    sessionStorage.setItem(storageKey, visitorId);
                }
            } catch (e2) {
                // 都不可用时，生成临时ID
                visitorId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
            }
        }
        return visitorId;
    }

    /**
     * 初始化会话
     * 会话超时时间为 30 分钟
     */
    function initSession() {
        const sessionKey = 'wpm_session_' + config.projectKey;
        const sessionTimeout = 30 * 60 * 1000; // 30分钟无活动视为新会话

        try {
            const sessionData = sessionStorage.getItem(sessionKey);
            const now = Date.now();

            if (sessionData) {
                try {
                    const data = JSON.parse(sessionData);
                    // 检查会话是否过期
                    if (now - data.lastActivity < sessionTimeout) {
                        sessionId = data.sessionId;
                        sessionStartTime = data.startTime;
                        sessionPageCount = data.pageCount || 0;
                        entryPage = data.entryPage;
                    } else {
                        // 会话过期，创建新会话
                        createNewSession();
                    }
                } catch (e) {
                    createNewSession();
                }
            } else {
                createNewSession();
            }

            function createNewSession() {
                sessionId = 'session_' + now + '_' + Math.random().toString(36).substring(2, 15);
                sessionStartTime = now;
                sessionPageCount = 0;
                entryPage = window.location.href;
            }

            // 更新会话数据
            sessionPageCount++;
            const sessionDataToSave = {
                sessionId: sessionId,
                startTime: sessionStartTime,
                lastActivity: now,
                pageCount: sessionPageCount,
                entryPage: entryPage
            };
            sessionStorage.setItem(sessionKey, JSON.stringify(sessionDataToSave));
        } catch (e) {
            // sessionStorage不可用时，使用内存存储
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
                sessionStartTime = Date.now();
                sessionPageCount = 0;
                entryPage = window.location.href;
            }
            sessionPageCount++;
        }
    }

    /**
     * 获取搜索词（从URL参数中提取）
     */
    function getSearchKeyword() {
        const urlParams = new URLSearchParams(window.location.search);
        // 常见搜索引擎的搜索参数
        const searchParams = ['q', 'query', 'wd', 'keyword', 'search', 'p'];
        
        for (const param of searchParams) {
            const value = urlParams.get(param);
            if (value) {
                return decodeURIComponent(value);
            }
        }

        // 从referrer中提取搜索词
        if (document.referrer) {
            try {
                const referrerUrl = new URL(document.referrer);
                const referrerParams = new URLSearchParams(referrerUrl.search);
                for (const param of searchParams) {
                    const value = referrerParams.get(param);
                    if (value) {
                        return decodeURIComponent(value);
                    }
                }
            } catch (e) {
                // 忽略解析错误
            }
        }

        return '';
    }

    /**
     * 解析来源（从referrer中提取）
     */
    function getSource() {
        const referrer = document.referrer;
        if (!referrer) {
            return '直接访问';
        }

        try {
            const referrerUrl = new URL(referrer);
            const hostname = referrerUrl.hostname.toLowerCase();

            // 常见搜索引擎
            const searchEngines = {
                'www.google.com': 'Google',
                'google.com': 'Google',
                'www.baidu.com': '百度',
                'baidu.com': '百度',
                'www.bing.com': 'Bing',
                'bing.com': 'Bing',
                'www.yahoo.com': 'Yahoo',
                'yahoo.com': 'Yahoo',
                'www.sogou.com': '搜狗',
                'sogou.com': '搜狗',
                'www.so.com': '360搜索',
                'so.com': '360搜索',
            };

            if (searchEngines[hostname]) {
                return searchEngines[hostname];
            }

            // 检查是否是当前域名
            if (hostname === window.location.hostname) {
                return '站内访问';
            }

            // 返回域名作为来源
            return hostname;
        } catch (e) {
            return referrer;
        }
    }

    /**
     * 获取访问时长（秒）
     */
    function getVisitDuration() {
        if (!sessionStartTime) {
            return 0;
        }
        return Math.floor((Date.now() - sessionStartTime) / 1000);
    }

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

        const perfData = {
            dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
            tcpTime: timing.connectEnd - timing.connectStart,
            requestTime: timing.responseStart - timing.requestStart,
            responseTime: timing.responseEnd - timing.responseStart,
            domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadTime: timing.loadEventEnd - timing.navigationStart,
            redirectTime: timing.redirectEnd - timing.redirectStart,
            type: navigation.type,
        };

        // 添加 Core Web Vitals
        if (window.performance.getEntriesByType) {
            // First Contentful Paint (FCP)
            const fcpEntry = window.performance.getEntriesByName('first-contentful-paint')[0];
            if (fcpEntry) {
                perfData.fcp = Math.round(fcpEntry.startTime);
            }

            // Largest Contentful Paint (LCP) - 从已收集的条目中获取
            const lcpEntries = window.performance.getEntriesByType('largest-contentful-paint');
            if (lcpEntries && lcpEntries.length > 0) {
                const lastEntry = lcpEntries[lcpEntries.length - 1];
                perfData.lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);
            }

            // First Input Delay (FID) - 从已收集的条目中获取
            const fidEntries = window.performance.getEntriesByType('first-input');
            if (fidEntries && fidEntries.length > 0) {
                const entry = fidEntries[0];
                if (entry.processingStart && entry.startTime) {
                    perfData.fid = Math.round(entry.processingStart - entry.startTime);
                }
            }

            // Cumulative Layout Shift (CLS) - 从已收集的条目中获取
            const clsEntries = window.performance.getEntriesByType('layout-shift');
            if (clsEntries && clsEntries.length > 0) {
                let clsValue = 0;
                for (const entry of clsEntries) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                perfData.cls = Math.round(clsValue * 1000) / 1000;
            }

            // Time to First Byte (TTFB)
            perfData.ttfb = timing.responseStart - timing.navigationStart;

            // 资源加载时间
            const resources = window.performance.getEntriesByType('resource');
            perfData.resources = resources.slice(0, 20).map(resource => ({
                name: resource.name,
                type: resource.initiatorType,
                duration: Math.round(resource.duration),
                size: resource.transferSize || 0,
            }));
        }

        return perfData;
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
            // 新增字段
            visitorId: getVisitorId(),
            sessionId: sessionId || '',
            entryPage: entryPage || window.location.href,
            source: getSource(),
            searchKeyword: getSearchKeyword(),
            visitDuration: getVisitDuration(),
            pageCount: sessionPageCount || 0,
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
     * 追踪页面访问事件
     */
    function trackPageView() {
        if (!config.trackPageView) return;

        // 立即发送页面访问事件
        track('pageview', { performance: null });

        // 延迟获取性能数据，确保所有指标都已收集
        if (config.trackPerformance && window.performance) {
            // 收集Core Web Vitals需要等待页面完全加载
            if (document.readyState === 'complete') {
                setTimeout(() => {
                    const performanceData = getPerformanceData();
                    if (performanceData && (performanceData.lcp || performanceData.fcp || performanceData.ttfb || performanceData.fid || performanceData.cls)) {
                        track('performance', { performance: performanceData });
                    }
                }, 2000);
            } else {
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        const performanceData = getPerformanceData();
                        if (performanceData && (performanceData.lcp || performanceData.fcp || performanceData.ttfb)) {
                            track('performance', { performance: performanceData });
                        }
                    }, 2000);
                });
            }
        }
    }

    /**
     * 追踪点击事件（已禁用）
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
     * 追踪错误事件（已禁用）
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
     * 初始化监控插件
     * @param {Object} options - 配置选项（可选，如果未提供则从URL参数读取）
     * @param {string} [options.apiUrl] - API 服务器地址（可选，可从URL参数 ?apiUrl=xxx 获取）
     * @param {string} [options.projectKey] - 项目 Key（可选，可从URL参数 ?key=xxx 或 ?projectKey=xxx 获取）
     * @param {boolean} [options.autoTrack=true] - 是否自动追踪
     * @param {boolean} [options.trackPageView=true] - 是否追踪页面访问
     */
    function init(options = {}) {
        // 先从URL参数获取配置
        const urlConfig = getConfigFromUrl();
        
        // 合并配置：URL参数 < 传入的options < 默认config
        Object.assign(config, urlConfig, options);

        if (!config.apiUrl || !config.projectKey) {
            console.error('监控插件初始化失败: 缺少 apiUrl 或 projectKey');
            console.error('请通过以下方式之一提供配置：');
            console.error('1. URL参数：?key=项目Key&apiUrl=API地址');
            console.error('2. 配置对象：WebPageMonitoring.init({ projectKey: "xxx", apiUrl: "xxx" })');
            return;
        }

        // 初始化会话和访客标识
        getVisitorId();
        initSession();

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

    // 自动初始化：从 script 标签获取配置并初始化
    (function autoInit() {
        const scriptConfig = getConfigFromScript();

        // 如果提供了 projectKey，尝试自动推断 apiUrl
        if (scriptConfig.projectKey && !scriptConfig.apiUrl) {
            // 自动推断：使用当前域名（同域）
            scriptConfig.apiUrl = window.location.origin;
        }

        // 如果有 projectKey 和 apiUrl，自动初始化
        if (scriptConfig.projectKey && scriptConfig.apiUrl) {
            // 延迟执行，确保所有代码都已加载
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    init(scriptConfig);
                });
            } else {
                // DOM已加载完成，立即初始化
                setTimeout(function() {
                    init(scriptConfig);
                }, 0);
            }
        } else {
            console.warn('监控插件未正确配置。请确保 script 标签包含 data-project-key 属性');
        }
    })();

    // 暴露 API
    window.WebPageMonitoring = {
        init: init,
        track: track,
        trackPageView: trackPageView,
        config: config,
    };

})(window);

