import client from './client';

/**
 * 实时统计 API
 */
export const analyticsAPI = {
  /**
   * 获取实时统计数据
   * @param {string} projectKey - 项目 Key
   * @param {number} minutes - 统计时间范围（分钟），默认 5 分钟
   * @returns {Promise} API 响应
   */
  getRealtimeStats: (projectKey, minutes = 5) => {
    return client.get(`/analytics/realtime/${projectKey}?minutes=${minutes}`);
  },
};

