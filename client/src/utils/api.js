import axios from 'axios';
import { getToken, getRefreshToken, setToken, removeToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor - Add access token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token, logout
        removeToken();
        window.location.href = '/admin/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken } = response.data;
        setToken(accessToken);

        // Update authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeToken();
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout'),
};

// Photos API
export const photosAPI = {
  getAll: (params) => api.get('/photos', { params }),
  upload: (data) => api.post('/photos/upload', data),
  delete: (id) => api.delete(`/photos/${id}`),
  bulkDelete: (photoIds) => api.post('/photos/bulk-delete', { photoIds }),
  getStats: () => api.get('/photos/stats/overview'),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  toggleUpload: () => api.patch('/settings/toggle-upload'),
};

// QR Code API
export const qrcodeAPI = {
  generate: (url) => api.post('/qrcode/generate', { url }),
};

// Cloudinary upload
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'wedding-photos'); // Force folder destination

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    formData
  );

  return {
    url: response.data.secure_url,
    public_id: response.data.public_id,
  };
};

export default api;
