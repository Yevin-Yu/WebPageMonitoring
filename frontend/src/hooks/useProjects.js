import { useState, useEffect, useCallback } from 'react';
import { projectsAPI } from '../api/projects';
import { getErrorMessage } from '../utils/errorHandler';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await projectsAPI.list();
      const projectList = Array.isArray(response?.data) ? response.data : [];

      setProjects(projectList);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return { projects, loading, error, refetch: loadProjects };
}

