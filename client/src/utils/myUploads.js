const STORAGE_KEY = 'myUploads';

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const write = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const getMyUploads = () => read();

export const addMyUploads = (photos) => {
  const existing = read();
  const entries = photos.map(p => ({
    photoId: p._id,
    deleteToken: p.delete_token,
    url: p.cloudinary_url,
    uploaderName: p.uploader_name,
    uploadedAt: p.upload_date || new Date().toISOString(),
  }));
  write([...entries, ...existing]);
};

export const removeMyUpload = (photoId) => {
  write(read().filter(e => e.photoId !== photoId));
};
