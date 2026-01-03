/**
 * 统计数据计算工具
 */

function calculateVitalStats(values) {
  if (!values || values.length === 0) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  return {
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p75: sorted[Math.floor(sorted.length * 0.75)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    count: values.length,
  };
}

function extractWebVitals(events) {
  const vitals = {
    lcp: [],
    fid: [],
    cls: [],
    fcp: [],
    ttfb: [],
  };

  events.forEach(event => {
    try {
      const eventData = JSON.parse(event.event_data || '{}');
      const perf = eventData.performance || {};
      if (perf.lcp) vitals.lcp.push(perf.lcp);
      if (perf.fid) vitals.fid.push(perf.fid);
      if (perf.cls) vitals.cls.push(perf.cls);
      if (perf.fcp) vitals.fcp.push(perf.fcp);
      if (perf.ttfb) vitals.ttfb.push(perf.ttfb);
    } catch (e) {
      // Ignore parse errors
    }
  });

  return {
    lcp: calculateVitalStats(vitals.lcp),
    fid: calculateVitalStats(vitals.fid),
    cls: calculateVitalStats(vitals.cls),
    fcp: calculateVitalStats(vitals.fcp),
    ttfb: calculateVitalStats(vitals.ttfb),
  };
}

function extractDeviceStats(events) {
  const deviceStats = {};
  const browserStats = {};
  const osStats = {};

  events.forEach(event => {
    const ua = event.user_agent || '';
    
    const deviceType = /mobile|android|iphone|ipad/i.test(ua)
      ? (/tablet|ipad/i.test(ua) ? 'tablet' : 'mobile')
      : 'desktop';
    deviceStats[deviceType] = (deviceStats[deviceType] || 0) + 1;

    let browser = 'unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    browserStats[browser] = (browserStats[browser] || 0) + 1;

    let os = 'unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    osStats[os] = (osStats[os] || 0) + 1;
  });

  return { devices: deviceStats, browsers: browserStats, os: osStats };
}

function aggregateErrors(events) {
  const errorGroups = {};

  events
    .filter(e => e.type === 'error')
    .forEach(event => {
      try {
        const eventData = JSON.parse(event.event_data || '{}');
        const message = eventData.message || 'Unknown error';
        const key = message.substring(0, 100);
        
        if (!errorGroups[key]) {
          errorGroups[key] = {
            message: key,
            count: 0,
            firstSeen: event.timestamp,
            lastSeen: event.timestamp,
            samples: [],
          };
        }
        
        errorGroups[key].count++;
        if (event.timestamp < errorGroups[key].firstSeen) {
          errorGroups[key].firstSeen = event.timestamp;
        }
        if (event.timestamp > errorGroups[key].lastSeen) {
          errorGroups[key].lastSeen = event.timestamp;
        }
        if (errorGroups[key].samples.length < 5) {
          errorGroups[key].samples.push({
            timestamp: event.timestamp,
            page: event.page_url,
            stack: eventData.stack || '',
          });
        }
      } catch (e) {
        // Ignore parse errors
      }
    });

  return Object.values(errorGroups)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculateTimeTrend(events) {
  const timeTrend = {};

  events.forEach(event => {
    const date = new Date(event.timestamp);
    const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
    
    if (!timeTrend[hourKey]) {
      timeTrend[hourKey] = { pageviews: 0, clicks: 0, errors: 0 };
    }
    
    if (event.type === 'pageview') timeTrend[hourKey].pageviews++;
    if (event.type === 'click') timeTrend[hourKey].clicks++;
    if (event.type === 'error') timeTrend[hourKey].errors++;
  });

  return Object.entries(timeTrend)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, data]) => ({ time, ...data }))
    .slice(-48);
}

module.exports = {
  extractWebVitals,
  extractDeviceStats,
  aggregateErrors,
  calculateTimeTrend,
};

