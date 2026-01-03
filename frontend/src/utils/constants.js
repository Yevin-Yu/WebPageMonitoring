/**
 * 应用常量定义
 */

// API 配置
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  TIMEOUT: 30000,
  RETRY_TIMES: 3,
  RETRY_DELAY: 1000,
};

// 时间范围选项
export const TIME_RANGES = {
  '24h': { label: '24小时', value: 24 * 60 * 60 * 1000 },
  '7d': { label: '7天', value: 7 * 24 * 60 * 60 * 1000 },
  '30d': { label: '30天', value: 30 * 24 * 60 * 60 * 1000 },
};

// 事件类型
export const EVENT_TYPES = {
  PAGEVIEW: 'pageview',
  CLICK: 'click',
  ERROR: 'error',
  PERFORMANCE: 'performance',
};

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 1000,
};

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// 错误代码
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
};

// 验证规则
export const VALIDATION = {
  PROJECT_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[\u4e00-\u9fa5a-zA-Z0-9\s\-_]+$/,
  },
  PROJECT_DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 50,
  },
};

// 性能指标阈值
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

// 图表配置
export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: '#1a1a1a',
    SECONDARY: '#666',
    TERTIARY: '#999',
    DANGER: '#8b0000',
    SUCCESS: '#28a745',
    WARNING: '#ffc107',
  },
  HEIGHT: {
    DEFAULT: 300,
    COMPACT: 200,
    TALL: 400,
  },
};

// 实时更新间隔
export const REALTIME_INTERVAL = 10000;

// 防抖延迟
export const DEBOUNCE_DELAY = 300;

// 节流间隔
export const THROTTLE_INTERVAL = 1000;

// UI 文本
export const UI_TEXT = {
  LOADING: '加载中...',
  NO_DATA: '暂无数据',
  ERROR: '出现错误',
  RETRY: '重试',
  SUBMIT: '提交',
  CANCEL: '取消',
};

// 路由路径
export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  MONITORING: '/monitoring',
  PROJECT_DETAIL: '/projects/:projectKey',
};

