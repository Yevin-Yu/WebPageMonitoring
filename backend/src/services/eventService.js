const { readEvents, appendEvent } = require('../repositories/eventRepository');
const { mapEventToRecord } = require('../utils/eventMapper');
const { createLogger } = require('../utils/logger');

const logger = createLogger('EventService');
const MAX_BATCH_SIZE = 1000;

/**
 * 保存事件数据
 * @param {string} projectKey - 项目 Key
 * @param {Array} events - 事件数组
 * @returns {Promise<number>} 成功保存的事件数量
 */
async function saveEvent(projectKey, events) {
  if (!projectKey || typeof projectKey !== 'string') {
    throw new Error('项目Key无效');
  }

  if (!Array.isArray(events) || events.length === 0) {
    return 0;
  }

  if (events.length > MAX_BATCH_SIZE) {
    throw new Error(`单次批量保存事件数量不能超过${MAX_BATCH_SIZE}`);
  }

  const allEvents = readEvents();
  const maxId = allEvents.length > 0
    ? Math.max(...allEvents.map(e => e.id || 0))
    : 0;

  let newId = maxId;
  let savedCount = 0;

  for (const event of events) {
    try {
      if (!event || typeof event !== 'object') {
        logger.warn('跳过无效事件数据');
        continue;
      }

      newId++;
      const eventRecord = mapEventToRecord(event, projectKey, newId);
      appendEvent(eventRecord);
      savedCount++;
    } catch (error) {
      logger.warn('保存单个事件失败', { error: error.message });
    }
  }

  return savedCount;
}

/**
 * 获取事件列表
 * @param {Object} options - 查询选项
 * @param {string} options.projectKey - 项目 Key
 * @param {string} [options.type] - 事件类型筛选
 * @param {string} [options.startTime] - 开始时间
 * @param {string} [options.endTime] - 结束时间
 * @param {number} [options.page=1] - 页码
 * @param {number} [options.pageSize=20] - 每页数量
 * @returns {Promise<Object>} 事件列表和分页信息
 */
async function getEvents({ projectKey, type, startTime, endTime, page = 1, pageSize = 20 }) {
  try {
    if (!projectKey) {
      throw new Error('项目Key不能为空');
    }

    // 验证分页参数
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedPageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 20));

    let events = readEvents();

    // 过滤事件
    events = events.filter(event => {
      try {
        if (event.project_key !== projectKey) return false;
        if (type && event.type !== type) return false;
        if (startTime && event.timestamp < startTime) return false;
        if (endTime && event.timestamp > endTime) return false;
        return true;
      } catch {
        return false;
      }
    });

    // 排序
    events.sort((a, b) => {
      try {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      } catch {
        return 0;
      }
    });

    const total = events.length;
    const startIndex = (validatedPage - 1) * validatedPageSize;
    const endIndex = startIndex + validatedPageSize;
    const paginatedEvents = events.slice(startIndex, endIndex);

    // 安全解析 JSON
    const parsedEvents = paginatedEvents.map(event => {
      try {
        return {
          ...event,
          event_data: JSON.parse(event.event_data || '{}'),
        };
      } catch {
        return {
          ...event,
          event_data: {},
        };
      }
    });

    return {
      data: parsedEvents,
      total,
      page: validatedPage,
      pageSize: validatedPageSize,
      totalPages: Math.ceil(total / validatedPageSize),
    };
  } catch (error) {
    logger.error('获取事件列表失败', error);
    throw new Error('获取事件列表失败: ' + error.message);
  }
}

/**
 * 获取项目统计数据
 * @param {string} projectKey - 项目 Key
 * @param {string} [startTime] - 开始时间
 * @param {string} [endTime] - 结束时间
 * @returns {Promise<Object>} 统计数据
 */
async function getProjectStats(projectKey, startTime, endTime) {
  const { extractWebVitals, extractDeviceStats, aggregateErrors, calculateTimeTrend } = require('../utils/statsCalculator');
  
  const allEvents = readEvents();

  const events = allEvents.filter(event => {
    if (event.project_key !== projectKey) return false;
    if (startTime && event.timestamp < startTime) return false;
    if (endTime && event.timestamp > endTime) return false;
    return true;
  });

  // 对页面访问进行去重：同一时间（精确到秒）、同一IP、同一页面只统计一次
  const pageviewEvents = events.filter(e => e.type === 'pageview');
  const uniquePageviews = new Set();
  const pageCounts = {};

  pageviewEvents.forEach(event => {
    // 生成唯一键：时间戳(精确到秒)_IP_页面URL
    const timestamp = new Date(event.timestamp);
    const timeKey = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')} ${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}`;
    const ip = event.user_ip || 'unknown';
    const pageUrl = event.page_url || '';
    const uniqueKey = `${timeKey}_${ip}_${pageUrl}`;
    
    // 只统计第一次出现的组合
    if (!uniquePageviews.has(uniqueKey)) {
      uniquePageviews.add(uniqueKey);
      
      // 统计热门页面
      const pageKey = `${event.page_url}|||${event.page_title || ''}`;
      pageCounts[pageKey] = (pageCounts[pageKey] || 0) + 1;
    }
  });

  const stats = {
    total_events: events.length,
    unique_visitors: new Set(events.map(e => e.user_ip).filter(ip => ip)).size,
    unique_pages: new Set(events.map(e => e.page_url).filter(url => url)).size,
    pageviews: uniquePageviews.size, // 使用去重后的数量
    clicks: 0, // 不再统计点击事件
    errors: 0, // 不再统计错误事件
  };

  const topPages = Object.entries(pageCounts)
    .map(([key, count]) => {
      const [url, title] = key.split('|||');
      return { page_url: url, page_title: title, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 对页面访问事件进行去重后提取 Web Vitals
  const uniquePageviewEvents = [];
  const uniqueKeys = new Set();
  pageviewEvents.forEach(event => {
    const timestamp = new Date(event.timestamp);
    const timeKey = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')} ${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}`;
    const ip = event.user_ip || 'unknown';
    const pageUrl = event.page_url || '';
    const uniqueKey = `${timeKey}_${ip}_${pageUrl}`;
    if (!uniqueKeys.has(uniqueKey)) {
      uniqueKeys.add(uniqueKey);
      uniquePageviewEvents.push(event);
    }
  });

  return {
    ...stats,
    topPages,
    webVitals: extractWebVitals(uniquePageviewEvents),
    ...extractDeviceStats(events),
    topErrors: [], // 不再统计错误
    timeTrend: calculateTimeTrend(events),
  };
}

/**
 * 获取事件类型统计
 * @param {string} projectKey - 项目 Key
 * @param {string} [startTime] - 开始时间
 * @param {string} [endTime] - 结束时间
 * @returns {Promise<Array>} 事件类型统计数组
 */
async function getEventStats(projectKey, startTime, endTime) {
  const events = readEvents().filter(event => {
    if (event.project_key !== projectKey) return false;
    if (startTime && event.timestamp < startTime) return false;
    if (endTime && event.timestamp > endTime) return false;
    return true;
  });

  const typeCounts = {};
  events.forEach(event => {
    const type = event.type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  return Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

module.exports = {
  saveEvent,
  getEvents,
  getProjectStats,
  getEventStats,
};


