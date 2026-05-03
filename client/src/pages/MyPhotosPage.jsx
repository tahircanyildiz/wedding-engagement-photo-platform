import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { photosAPI } from '../utils/api';
import { getMyUploads, removeMyUpload } from '../utils/myUploads';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const optimizeUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/');
};

const MyPhotosPage = () => {
  const [uploads, setUploads] = useState(() => getMyUploads());
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = useCallback(async (entry) => {
    if (!window.confirm('Bu fotoğrafı silmek istediğine emin misin?')) return;
    setDeletingId(entry.photoId);
    try {
      await photosAPI.deleteWithToken(entry.photoId, entry.deleteToken);
      removeMyUpload(entry.photoId);
      setUploads(prev => prev.filter(e => e.photoId !== entry.photoId));
      toast.success('Fotoğraf silindi');
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        // Zaten silinmiş, localStorage'ı temizle
        removeMyUpload(entry.photoId);
        setUploads(prev => prev.filter(e => e.photoId !== entry.photoId));
        toast.info('Bu fotoğraf zaten silinmiş');
      } else if (status === 403) {
        toast.error('Bu fotoğrafı silme yetkin yok');
      } else {
        toast.error('Silme başarısız oldu');
      }
    } finally {
      setDeletingId(null);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-20 pb-28 md:pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-elegant font-bold text-romantic-700 mb-1">
              Yüklediklerim
            </h1>
            <p className="text-gray-500 text-sm md:text-lg">
              {uploads.length === 0
                ? 'Henüz bu cihazdan fotoğraf yüklemedin'
                : `${uploads.length} fotoğraf — yanlış yüklediklerini buradan silebilirsin`}
            </p>
          </div>

          {uploads.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-8 text-center">
              <div className="text-6xl mb-4">📤</div>
              <p className="text-gray-600 mb-6">
                Bu cihazdan yüklediğin fotoğraflar burada listelenir.
              </p>
              <Link to="/upload" className="btn-primary inline-block">
                Fotoğraf Yükle
              </Link>
            </div>
          )}

          {uploads.length > 0 && (
            <>
              <div className="bg-romantic-50 border border-romantic-200 rounded-xl p-3 mb-4 text-sm text-gray-700">
                <p>
                  💡 Bu liste sadece <strong>bu cihazda</strong> tutulur. Tarayıcı verisi
                  silinirse veya farklı cihaz kullanırsan listenin tamamına erişemezsin.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {uploads.map((entry) => (
                  <div
                    key={entry.photoId}
                    className="relative bg-white rounded-xl shadow-md overflow-hidden group"
                  >
                    <img
                      src={optimizeUrl(entry.url)}
                      alt={entry.uploaderName}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                    <div className="p-2">
                      <p className="text-xs text-gray-500 truncate">
                        {entry.uploadedAt
                          ? format(new Date(entry.uploadedAt), 'dd MMM yyyy HH:mm', { locale: tr })
                          : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(entry)}
                      disabled={deletingId === entry.photoId}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white p-2 rounded-full shadow-lg transition-colors"
                      title="Sil"
                    >
                      {deletingId === entry.photoId ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPhotosPage;
