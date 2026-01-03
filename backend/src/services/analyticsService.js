const { readEvents } = require('../repositories/eventRepository');

/**
 * 获取实时统计数据
 * @param {string} projectKey - 项目 Key
 * @param {number} minutes - 统计时间范围（分钟），默认 5 分钟
 * @returns {Promise<Object>} 实时统计数据
 */
async function getRealtimeStats(projectKey, minutes = 5) {
  const now = new Date();
  const startTime = new Date(now.getTime() - minutes * 60 * 1000).toISOString();

  let events = readEvents();

  events = events.filter(event => {
    if (event.project_key !== projectKey) return false;
    if (event.timestamp < startTime) return false;
    return true;
  });

  // 按分钟统计（只统计页面访问，并进行去重）
  const minuteStats = {};
  const pageviewEvents = events.filter(e => e.type === 'pageview');
  const uniquePageviewsByMinute = {};

  pageviewEvents.forEach(event => {
    const date = new Date(event.timestamp);
    const minuteKey = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    if (!minuteStats[minuteKey]) {
      minuteStats[minuteKey] = {
        time: minuteKey,
        pageviews: 0,
        clicks: 0,
        errors: 0,
        visitors: new Set(),
      };
      uniquePageviewsByMinute[minuteKey] = new Set();
    }
    
    // 生成唯一键：时间戳(精确到秒)_IP_页面URL
    const timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    const ip = event.user_ip || 'unknown';
    const pageUrl = event.page_url || '';
    const uniqueKey = `${timeKey}_${ip}_${pageUrl}`;
    
    // 只统计第一次出现的组合
    if (!uniquePageviewsByMinute[minuteKey].has(uniqueKey)) {
      uniquePageviewsByMinute[minuteKey].add(uniqueKey);
      minuteStats[minuteKey].pageviews++;
      if (event.visitor_id) minuteStats[minuteKey].visitors.add(event.visitor_id);
    }
  });

  const stats = Object.values(minuteStats).map(s => ({
    time: s.time,
    pageviews: s.pageviews,
    clicks: s.clicks,
    errors: s.errors,
    visitors: s.visitors.size,
  }));

  // 当前在线用户（最近1分钟有活动）
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
  const recentVisitors = new Set(
    events
      .filter(e => e.timestamp >= oneMinuteAgo)
      .map(e => e.visitor_id)
      .filter(id => id)
  );

  // 对当前统计也进行去重
  const currentPageviews = events.filter(e => e.type === 'pageview');
  const currentUniquePageviews = new Set();
  currentPageviews.forEach(event => {
    const timestamp = new Date(event.timestamp);
    const timeKey = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')} ${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}`;
    const ip = event.user_ip || 'unknown';
    const pageUrl = event.page_url || '';
    const uniqueKey = `${timeKey}_${ip}_${pageUrl}`;
    currentUniquePageviews.add(uniqueKey);
  });

  return {
    current: {
      pageviews: currentUniquePageviews.size,
      clicks: 0,
      errors: 0,
      visitors: recentVisitors.size,
    },
    timeline: stats.sort((a, b) => a.time.localeCompare(b.time)),
  };
}

module.exports = {
  getRealtimeStats,
};
