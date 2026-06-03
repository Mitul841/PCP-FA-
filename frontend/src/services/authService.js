import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  getAllUsers: async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/auth/users', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/auth/users/${id}`);
    return response.data;
  },
};

export const syncService = {
  testSync: async () => {
    const response = await api.post('/sync/test');
    return response.data;
  },

  syncStudents: async (apiUrl, apiKey = null) => {
    const response = await api.post('/sync/students', {
      apiUrl,
      apiKey,
    });
    return response.data;
  },

  getSyncHistory: async (page = 1, limit = 10, syncType = 'students') => {
    const response = await api.get('/sync/history', {
      params: { page, limit, syncType },
    });
    return response.data;
  },

  getSyncDetails: async (id) => {
    const response = await api.get(`/sync/${id}`);
    return response.data;
  },
};
