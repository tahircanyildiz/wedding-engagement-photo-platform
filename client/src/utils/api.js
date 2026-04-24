import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
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
  const TARGET_MB = 2;
  const fileSizeMB = file.size / (1024 * 1024);

  // 2MB altındaki dosyaları olduğu gibi gönder
  if (fileSizeMB <= TARGET_MB) {
    return file;
  }

  const options = {
    maxSizeMB: TARGET_MB,
    maxWidthOrHeight: 2560,
    useWebWorker: false,
    preserveExif: true,
    initialQuality: 0.88,
  };

  try {
    const compressed = await imageCompression(file, options);
    const compressedBuffer = await compressed.arrayBuffer();
    return new File([compressedBuffer], file.name, { type: file.type });
  } catch (error) {
    console.error('Sıkıştırma hatası, orijinal kullanılıyor:', error);
    return file;
  }
};

// Firebase Storage upload - doğrudan tarayıcıdan yükleme (mobil veri uyumlu, hızlı)
export const uploadToCloudinary = async (file, onProgress = null) => {
  const processedFile = await compressImageIfNeeded(file);

  const fileName = `${Date.now()}_${processedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storageRef = ref(storage, `wedding-photos/${fileName}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, processedFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
        }
      },
      (error) => {
        if (!navigator.onLine) {
          reject(new Error('İnternet bağlantınızı kontrol edin.'));
        } else {
          reject(error);
        }
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ url, public_id: `wedding-photos/${fileName}` });
      }
    );
  });
};

export default api;
