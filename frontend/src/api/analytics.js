import client from './client';

export const analyticsAPI = {
  // 获取用户路径分析
  getUserPaths: (projectKey, startTime, endTime) => {
    const params = new URLSearchParams();
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    return client.get(`/analytics/paths/${projectKey}?${params.toString()}`);
  },

  // 获取转化漏斗
  getConversionFunnel: (projectKey, steps, startTime, endTime) => {
    return client.post(`/analytics/funnel/${projectKey}`, {
      steps,
      startTime,
      endTime,
    });
  },

  // 获取实时统计
  getRealtimeStats: (projectKey, minutes = 5) => {
    return client.get(`/analytics/realtime/${projectKey}?minutes=${minutes}`);
  },

  // 获取地域统计
  getRegionStats: (projectKey, startTime, endTime) => {
    const params = new URLSearchParams();
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    return client.get(`/analytics/regions/${projectKey}?${params.toString()}`);
  },
};

