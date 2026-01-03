import { useState, useEffect, useCallback } from 'react';
import { projectsAPI } from '../api/projects';
import { getErrorMessage } from '../utils/errorHandler';
import { TIME_RANGES } from '../utils/constants';

export function useStats(projectKey, timeRange = '24h') {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    if (!projectKey) return;

    try {
      setError(null);
      setLoading(true);

      const timeRangeConfig = TIME_RANGES[timeRange];
      const now = new Date();
      const startTime = timeRangeConfig
        ? new Date(now.getTime() - timeRangeConfig.value)
        : null;

      const response = await projectsAPI.getStats(
        projectKey,
        startTime?.toISOString(),
        undefined
      );

      if (!response?.data) {
        throw new Error('返回数据格式错误');
      }

      setStats(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [projectKey, timeRange]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refetch: loadStats };
}

