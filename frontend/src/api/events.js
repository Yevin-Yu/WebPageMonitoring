import client from './client';

export const eventsAPI = {
  list: (projectKey, params) =>
    client.get('/events', { params: { projectKey, ...params } }),

  getStats: (projectKey, startTime, endTime) =>
    client.get('/events/stats', { params: { projectKey, startTime, endTime } }),
};


