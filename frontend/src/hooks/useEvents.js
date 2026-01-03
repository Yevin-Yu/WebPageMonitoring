import { useState, useEffect, useCallback } from 'react';
import { eventsAPI } from '../api/events';
import { getErrorMessage } from '../utils/errorHandler';

export function useEvents(projectKey, options = {}) {
  const { type, page = 1, pageSize = 50 } = options;
  const [events, setEvents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEvents = useCallback(async () => {
    if (!projectKey) return;

    try {
      setError(null);
      setLoading(true);

      const response = await eventsAPI.list(projectKey, {
        page,
        pageSize,
        type: type || undefined,
      });

      if (!response?.data) {
        throw new Error('返回数据格式错误');
      }

      setEvents(Array.isArray(response.data.data) ? response.data.data : []);
      setTotalPages(Math.max(1, response.data.totalPages || 1));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [projectKey, type, page, pageSize]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return { events, totalPages, loading, error, refetch: loadEvents };
}

