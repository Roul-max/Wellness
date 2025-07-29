import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('wellness_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('wellness_token');
          localStorage.removeItem('wellness_user');
          window.location.href = '/login';
        }
        
        const message = error.response?.data?.error || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
      }
    );
  }

  setToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Auth endpoints
  async register(email, password) {
    return await this.client.post('/auth/register', { email, password });
  }

  async login(email, password) {
    return await this.client.post('/auth/login', { email, password });
  }

  async getCurrentUser() {
    return await this.client.get('/auth/me');
  }

  // Session endpoints
  async getPublicSessions(params = {}) {
    return await this.client.get('/sessions', { params });
  }

  async getUserSessions(params = {}) {
    return await this.client.get('/my-sessions', { params });
  }

  async getSession(id) {
    return await this.client.get(`/my-sessions/${id}`);
  }

  async saveDraft(sessionData) {
    return await this.client.post('/my-sessions/save-draft', sessionData);
  }

  async publishSession(sessionData) {
    return await this.client.post('/my-sessions/publish', sessionData);
  }

  async deleteSession(id) {
    return await this.client.delete(`/my-sessions/${id}`);
  }

  // Utility method for health check
  async healthCheck() {
    return await this.client.get('/health');
  }
}

export const api = new ApiService();