import { useState, useEffect } from 'react';
import { photosAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

const PhotoManagement = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await photosAPI.getAll({ sort: 'newest', limit: 1000 });
      setPhotos(response.data.photos ?? response.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Fotoğraflar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPhoto = (photoId) => {
    setSelectedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId);
      } else {
        return [...prev, photoId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPhotos.length === filteredPhotos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(filteredPhotos.map(photo => photo._id));
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await photosAPI.delete(photoId);
      toast.success('Fotoğraf silindi');
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Fotoğraf silinirken hata oluştu');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPhotos.length === 0) {
      toast.warning('Lütfen en az bir fotoğraf seçin');
      return;
    }

    if (!window.confirm(`${selectedPhotos.length} fotoğrafı silmek istediğinizden emin misiniz?`)) {
      return;
    }

    setDeleting(true);
    try {
      await photosAPI.bulkDelete(selectedPhotos);
      toast.success(`${selectedPhotos.length} fotoğraf silindi`);
      setSelectedPhotos([]);
      fetchPhotos();
    } catch (error) {
      console.error('Error bulk deleting photos:', error);
      toast.error('Fotoğraflar silinirken hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  const handlePhotoClick = (index) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const filteredPhotos = searchQuery
    ? photos.filter(photo =>
        photo.uploader_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : photos;

  const lightboxSlides = filteredPhotos.map(photo => ({
    src: photo.cloudinary_url,
    title: photo.uploader_name,
    description: format(new Date(photo.upload_date), 'dd MMMM yyyy, HH:mm', { locale: tr })
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-romantic-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Fotoğraf Yönetimi</h1>
        <p className="text-gray-600">Tüm fotoğrafları görüntüleyin ve yönetin</p>
      </div>

      {/* Actions Bar */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="İsme göre ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSelectAll}
              className="btn-secondary text-sm py-2"
            >
              {selectedPhotos.length === filteredPhotos.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
            </button>
            {selectedPhotos.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Siliniyor...' : `${selectedPhotos.length} Fotoğraf Sil`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            {searchQuery ? 'Fotoğraf bulunamadı' : 'Henüz fotoğraf yok'}
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Bu filtreye uygun fotoğraf bulunamadı'
              : 'Henüz hiç fotoğraf yüklenmemiş'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo, index) => (
            <div key={photo._id} className="relative group">
              {/* Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedPhotos.includes(photo._id)}
                  onChange={() => handleSelectPhoto(photo._id)}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>

              {/* Photo */}
              <div
                className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handlePhotoClick(index)}
              >
                <img
                  src={photo.cloudinary_url}
                  alt={photo.uploader_name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="font-bold truncate">{photo.uploader_name}</p>
                    <p className="text-xs">
                      {format(new Date(photo.upload_date), 'dd MMM yyyy', { locale: tr })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePhoto(photo._id);
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                title="Sil"
              >
                <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>

              {/* Info Card */}
              <div className="mt-2 p-2 bg-white rounded-lg text-sm">
                <p className="font-bold text-gray-800 truncate">{photo.uploader_name}</p>
                <p className="text-gray-500 text-xs">
                  {format(new Date(photo.upload_date), 'dd MMM yyyy, HH:mm', { locale: tr })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={currentPhotoIndex}
        slides={lightboxSlides}
        carousel={{ finite: true }}
      />
    </div>
  );
};

export default PhotoManagement;
