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

    // 会话管理
    let sessionId = null;
    let sessionStartTime = null;
    let sessionPageCount = 0;
    let entryPage = null;
    let visitorId = null;

    /**
     * 生成或获取访客标识码
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
     * 追踪页面访问
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

    // 暴露 API
    window.WebPageMonitoring = {
        init: init,
        track: track,
        trackPageView: trackPageView,
        config: config,
    };

})(window);

