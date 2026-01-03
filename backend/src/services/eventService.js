const { readEvents, appendEvent } = require('../repositories/eventRepository');
const { mapEventToRecord } = require('../utils/eventMapper');
const { createLogger } = require('../utils/logger');

const logger = createLogger('EventService');
const MAX_BATCH_SIZE = 1000;

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
 */
async function getEvents({ projectKey, type, startTime, endTime, page = 1, pageSize = 50 }) {
  try {
    if (!projectKey) {
      throw new Error('项目Key不能为空');
    }

    // 验证分页参数
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedPageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 50));

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

async function getProjectStats(projectKey, startTime, endTime) {
  const { extractWebVitals, extractDeviceStats, aggregateErrors, calculateTimeTrend } = require('../utils/statsCalculator');
  
  const events = readEvents();

  events = events.filter(event => {
    if (event.project_key !== projectKey) return false;
    if (startTime && event.timestamp < startTime) return false;
    if (endTime && event.timestamp > endTime) return false;
    return true;
  });

  const stats = {
    total_events: events.length,
    unique_visitors: new Set(events.map(e => e.user_ip).filter(ip => ip)).size,
    unique_pages: new Set(events.map(e => e.page_url).filter(url => url)).size,
    pageviews: events.filter(e => e.type === 'pageview').length,
    clicks: events.filter(e => e.type === 'click').length,
    errors: events.filter(e => e.type === 'error').length,
  };

  const pageviewEvents = events.filter(e => e.type === 'pageview');
  const pageCounts = {};

  pageviewEvents.forEach(event => {
    const key = `${event.page_url}|||${event.page_title || ''}`;
    pageCounts[key] = (pageCounts[key] || 0) + 1;
  });

  const topPages = Object.entries(pageCounts)
    .map(([key, count]) => {
      const [url, title] = key.split('|||');
      return { page_url: url, page_title: title, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    ...stats,
    topPages,
    webVitals: extractWebVitals(pageviewEvents),
    ...extractDeviceStats(events),
    topErrors: aggregateErrors(events),
    timeTrend: calculateTimeTrend(events),
  };
}

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


