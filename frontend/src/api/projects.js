import client from './client';

export const projectsAPI = {
  list: () =>
    client.get('/projects'),

  create: (name, description) =>
    client.post('/projects', { name, description }),

  getStats: (projectKey, startTime, endTime) =>
    client.get(`/projects/${projectKey}`, { params: { startTime, endTime } }),
};


