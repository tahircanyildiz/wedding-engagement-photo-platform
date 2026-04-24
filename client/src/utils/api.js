import axios from 'axios';
import imageCompression from 'browser-image-compression';
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

// Memories API
export const memoriesAPI = {
  getAll: (params) => api.get('/memories', { params }),
  create: (data) => api.post('/memories', data),
  delete: (id) => api.delete(`/memories/${id}`),
  bulkDelete: (memoryIds) => api.post('/memories/bulk-delete', { memoryIds }),
  getStats: () => api.get('/memories/stats/overview'),
};

// Büyük dosyaları sıkıştır (10MB üstü) - kaliteyi koruyarak
const compressImageIfNeeded = async (file) => {
  const MAX_SIZE_MB = 9.5;
  const fileSizeMB = file.size / (1024 * 1024);

  if (fileSizeMB <= MAX_SIZE_MB) {
    // Orijinal File referansını kopyala — ERR_UPLOAD_FILE_CHANGED'ı önler
    return new File([file], file.name, { type: file.type });
  }

  const options = {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: 4096,
    useWebWorker: false, // Mobil veri'de WebWorker script yüklenemiyor
    preserveExif: true,
    initialQuality: 0.92,
  };

  try {
    const compressed = await imageCompression(file, options);
    // Yeni bir File nesnesi oluştur — tarayıcının dosya değişti hatası vermesini engeller
    return new File([compressed], file.name, { type: file.type });
  } catch (error) {
    console.error('Sıkıştırma hatası:', error);
    return new File([file], file.name, { type: file.type });
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Cloudinary upload - backend proxy üzerinden (mobil veri uyumlu)
export const uploadToCloudinary = async (file, onProgress = null, delayMs = 0) => {
  if (delayMs > 0) await sleep(delayMs);

  const processedFile = await compressImageIfNeeded(file);

  const formData = new FormData();
  formData.append('file', processedFile);

  try {
    const response = await api.post('/photos/cloudinary-upload', formData, {
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      } : undefined,
    });

    return {
      url: response.data.url,
      public_id: response.data.public_id,
    };
  } catch (error) {
    if (!navigator.onLine) {
      throw new Error('İnternet bağlantınızı kontrol edin.');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Yükleme zaman aşımına uğradı. Lütfen tekrar deneyin.');
    }
    throw error;
  }
};

export default api;
