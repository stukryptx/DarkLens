import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_URL
});

// Add a request interceptor to attach the JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a global response interceptor — auto-logout on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired — clear session and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
  register: (data) => axios.post(`${API_URL}/auth/register`, data),

  // Forums
  getForums: () => apiClient.get(`/forums`),
  getForumById: (id) => apiClient.get(`/forums/${id}`),
  createForum: (data) => apiClient.post(`/forums`, data),
  updateForum: (id, data) => apiClient.put(`/forums/${id}`, data),
  deleteForum: (id, cascade = false) => apiClient.delete(`/forums/${id}${cascade ? '?cascade=true' : ''}`),
  
  // Identities
  getIdentities: () => apiClient.get(`/identities`),
  createIdentity: (data) => apiClient.post(`/identities`, data),
  
  // Notes
  getNotes: (forumId) => apiClient.get(forumId ? `/notes?forumId=${forumId}` : `/notes`),
  createNote: (data) => apiClient.post(`/notes`, data),
  updateNote: (id, data) => apiClient.put(`/notes/${id}`, data),
  deleteNote: (id) => apiClient.delete(`/notes/${id}`),

  // Saved Posts
  getSavedPosts: (forumId) => apiClient.get(forumId ? `/saved-posts?forumId=${forumId}` : `/saved-posts`),
  createSavedPost: (data) => apiClient.post(`/saved-posts`, data),
  updateSavedPost: (id, data) => apiClient.put(`/saved-posts/${id}`, data),
  deleteSavedPost: (id) => apiClient.delete(`/saved-posts/${id}`),

  // Channels
  getChannels: (forumId) => apiClient.get(forumId ? `/channels?forumId=${forumId}` : `/channels`),
  createChannel: (data) => apiClient.post(`/channels`, data),
  deleteChannel: (id) => apiClient.delete(`/channels/${id}`),
  getTelegramMessages: (forumId) => apiClient.get(`/channels/messages/${forumId}`),
  forceSyncTelegram: (forumId) => apiClient.post(`/channels/sync/${forumId}`),

  // Sessions / Playwright
  launchSession: (data) => apiClient.post(`/sessions/launch`, data),
  saveSession: (data) => apiClient.post(`/sessions/save`, data),
  openSession: (data) => apiClient.post(`/sessions/open`, data),

  // Identities by forum
  getIdentitiesByForum: (forumId) => apiClient.get(`/identities?forumId=${forumId}`),

  // Diagnosis
  diagnosisSync: (forumId) => apiClient.post(`/diagnosis/sync/${forumId}`),
  getDnsHistory: (forumId) => apiClient.get(`/diagnosis/history/${forumId}`),

  // Telegram MTProto
  telegramStatus: () => apiClient.get(`/telegram/status`),
  telegramSendCode: (data) => apiClient.post(`/telegram/send-code`, data),
  telegramVerifyCode: (data) => apiClient.post(`/telegram/verify-code`, data),
  telegramDisconnect: () => apiClient.post(`/telegram/disconnect`),
};
