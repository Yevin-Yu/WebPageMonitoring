const { readEvents } = require('../repositories/eventRepository');

/**
 * 获取用户路径分析
 */
async function getUserPaths(projectKey, startTime, endTime) {
  let events = readEvents();

  events = events.filter(event => {
    if (event.project_key !== projectKey) return false;
    if (startTime && event.timestamp < startTime) return false;
    if (endTime && event.timestamp > endTime) return false;
    if (event.type !== 'pageview') return false;
    return true;
  });

  // 按会话分组
  const sessions = {};
  events.forEach(event => {
    const sessionId = event.session_id || 'unknown';
    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }
    sessions[sessionId].push({
      url: event.page_url,
      title: event.page_title,
      timestamp: event.timestamp,
    });
  });

  // 计算路径
  const paths = [];
  Object.values(sessions).forEach(session => {
    if (session.length > 1) {
      const path = session.map(p => p.url).join(' → ');
      paths.push({
        path,
        count: 1,
        pages: session.length,
      });
    }
  });

  // 聚合相同路径
  const pathCounts = {};
  paths.forEach(p => {
    if (!pathCounts[p.path]) {
      pathCounts[p.path] = { path: p.path, count: 0, pages: p.pages };
    }
    pathCounts[p.path].count++;
  });

  return Object.values(pathCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * 获取转化漏斗
 */
async function getConversionFunnel(projectKey, steps, startTime, endTime) {
  let events = readEvents();

  events = events.filter(event => {
    if (event.project_key !== projectKey) return false;
    if (startTime && event.timestamp < startTime) return false;
    if (endTime && event.timestamp > endTime) return false;
    return true;
  });

  // 按会话分组
  const sessions = {};
  events.forEach(event => {
    const sessionId = event.session_id || 'unknown';
    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }
    sessions[sessionId].push({
      url: event.page_url,
      type: event.type,
      timestamp: event.timestamp,
    });
  });

  // 计算每步转化
  const funnel = steps.map((step, index) => {
    let count = 0;
    Object.values(sessions).forEach(session => {
      // 检查是否完成了前面的所有步骤
      let completedPrevious = true;
      for (let i = 0; i < index; i++) {
        const prevStep = steps[i];
        const hasStep = session.some(e => {
          if (prevStep.type === 'pageview') {
            return e.type === 'pageview' && e.url.includes(prevStep.url);
          }
          return e.type === prevStep.type;
        });
        if (!hasStep) {
          completedPrevious = false;
          break;
        }
      }
      
      if (completedPrevious) {
        const hasCurrentStep = session.some(e => {
          if (step.type === 'pageview') {
            return e.type === 'pageview' && e.url.includes(step.url);
          }
          return e.type === step.type;
        });
        if (hasCurrentStep) {
          count++;
        }
      }
    });

    return {
      step: step.name,
      count,
      conversionRate: index === 0 ? 100 : (count / funnel[0].count * 100).toFixed(2),
    };
  });

  return funnel;
}

/**
 * 获取实时统计数据
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

  // 按分钟统计
  const minuteStats = {};
  events.forEach(event => {
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
    }
    if (event.type === 'pageview') minuteStats[minuteKey].pageviews++;
    if (event.type === 'click') minuteStats[minuteKey].clicks++;
    if (event.type === 'error') minuteStats[minuteKey].errors++;
    if (event.visitor_id) minuteStats[minuteKey].visitors.add(event.visitor_id);
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

  return {
    current: {
      pageviews: events.filter(e => e.type === 'pageview').length,
      clicks: events.filter(e => e.type === 'click').length,
      errors: events.filter(e => e.type === 'error').length,
      visitors: recentVisitors.size,
    },
    timeline: stats.sort((a, b) => a.time.localeCompare(b.time)),
  };
}

/**
 * 获取地域分布
 */
async function getRegionStats(projectKey, startTime, endTime) {
  let events = readEvents();

  events = events.filter(event => {
    if (event.project_key !== projectKey) return false;
    if (startTime && event.timestamp < startTime) return false;
    if (endTime && event.timestamp > endTime) return false;
    return true;
  });

  const regionStats = {};
  events.forEach(event => {
    const region = event.region || '未知';
    if (!regionStats[region]) {
      regionStats[region] = {
        region,
        pageviews: 0,
        visitors: new Set(),
      };
    }
    if (event.type === 'pageview') {
      regionStats[region].pageviews++;
      if (event.visitor_id) {
        regionStats[region].visitors.add(event.visitor_id);
      }
    }
  });

  return Object.values(regionStats)
    .map(s => ({
      region: s.region,
      pageviews: s.pageviews,
      visitors: s.visitors.size,
    }))
    .sort((a, b) => b.pageviews - a.pageviews);
}

module.exports = {
  getUserPaths,
  getConversionFunnel,
  getRealtimeStats,
  getRegionStats,
};

