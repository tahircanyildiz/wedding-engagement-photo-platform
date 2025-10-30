import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
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
