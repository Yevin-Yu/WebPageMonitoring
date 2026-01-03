import client from './client';

export const authAPI = {
  register: (username, password, email) =>
    client.post('/register', { username, password, email }),

  login: (username, password) =>
    client.post('/login', { username, password }),

  logout: () =>
    client.post('/logout'),

  getMe: () =>
    client.get('/me'),
};


