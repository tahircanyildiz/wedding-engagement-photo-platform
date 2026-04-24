import { useState, useEffect, useMemo, useCallback } from 'react';
import { photosAPI, settingsAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Masonry from 'react-masonry-css';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Cloudinary URL'i optimize et (thumbnail veya full quality)
const optimizeCloudinaryUrl = (url, type = 'thumbnail') => {
  if (!url || !url.includes('cloudinary.com')) return url;

  // Cloudinary transformasyonları
  const transforms = {
    thumbnail: 'w_400,h_400,c_fill,q_auto,f_auto', // Galeri için küçük
    medium: 'w_800,q_auto,f_auto', // Orta boy
    full: 'q_auto,f_auto' // Tam kalite ama optimize format
  };

  // /upload/ kısmından sonra transform ekle
  return url.replace('/upload/', `/upload/${transforms[type]}/`);
};

const GalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterUploader, setFilterUploader] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Derived state - settings yüklenince hesaplanır
  const filterEnabled = settings?.gallery_filter_enabled !== false;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Settings ve photos'u paralel yükle ama ikisi de bitene kadar bekle
        const [settingsRes, photosRes] = await Promise.all([
          settingsAPI.get(),
          photosAPI.getAll({ sort: sortBy })
        ]);

        setSettings(settingsRes.data);
        setPhotos(photosRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sortBy]);

  const handlePhotoClick = (index) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handleDownload = useCallback(async (url, uploaderName) => {
    try {
      // İndirme için orijinal kalitede URL kullan
      const downloadableUrl = optimizeCloudinaryUrl(url, 'full');
      const response = await fetch(downloadableUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `wedding-photo-${uploaderName}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Fotoğraf indirilirken hata oluştu');
    }
  }, []);

  const filteredPhotos = filterUploader
    ? photos.filter(photo =>
        photo.uploader_name.toLowerCase().includes(filterUploader.toLowerCase())
      )
    : photos;

  const breakpointColumns = {
    default: 4,
    1280: 3,
    768: 2,
    640: 2
  };

  // Memoize lightbox slides - her render'da yeniden hesaplanmasın
  const lightboxSlides = useMemo(() =>
    filteredPhotos.map(photo => ({
      src: optimizeCloudinaryUrl(photo.cloudinary_url, 'full'), // Lightbox için full kalite
      title: photo.uploader_name,
      description: format(new Date(photo.upload_date), 'dd MMMM yyyy, HH:mm', { locale: tr })
    })), [filteredPhotos]);

  // Settings ve photos yüklenene kadar loading göster
  if (loading || !settings) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 pb-28 md:pb-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-elegant font-bold text-romantic-700 mb-2">
                Fotoğraf Galerisi
              </h1>
            </div>
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-romantic-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-20 pb-28 md:pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-elegant font-bold text-romantic-700 mb-1">
              Fotoğraf Galerisi
            </h1>
            <p className="text-gray-500 text-sm md:text-lg">
              {filteredPhotos.length} fotoğraf
            </p>
          </div>

          {/* Filters - sadece filterEnabled true ise göster */}
          {filterEnabled && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sıralama
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field"
                  >
                    <option value="newest">En Yeni</option>
                    <option value="oldest">En Eski</option>
                  </select>
                </div>

                {/* Filter by uploader */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yükleyene Göre Filtrele
                  </label>
                  <input
                    type="text"
                    placeholder="İsim ile ara..."
                    value={filterUploader}
                    onChange={(e) => setFilterUploader(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredPhotos.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                {filterUploader ? 'Fotoğraf bulunamadı' : 'Henüz fotoğraf yok'}
              </h3>
              <p className="text-gray-600">
                {filterUploader
                  ? 'Bu filtreye uygun fotoğraf bulunamadı'
                  : 'İlk fotoğrafı sen yükle!'}
              </p>
            </div>
          )}

          {/* Gallery Grid */}
          {filteredPhotos.length > 0 && (
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex -ml-4 w-auto"
              columnClassName="pl-4 bg-clip-padding"
            >
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo._id}
                  className="mb-4 group cursor-pointer relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  onClick={() => handlePhotoClick(index)}
                >
                  <img
                    src={optimizeCloudinaryUrl(photo.cloudinary_url, 'thumbnail')}
                    alt={`Yükleyen: ${photo.uploader_name}`}
                    className="w-full h-auto block group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Overlay - mobilde her zaman görünür alt gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 text-white">
                      <p className="font-semibold text-sm md:text-lg leading-tight">{photo.uploader_name}</p>
                      <p className="text-xs opacity-80 hidden md:block">
                        {format(new Date(photo.upload_date), 'dd MMM yyyy, HH:mm', { locale: tr })}
                      </p>
                    </div>
                  </div>

                  {/* Download Button - mobilde her zaman görünür */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(photo.cloudinary_url, photo.uploader_name);
                    }}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 md:p-2 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                    title="İndir"
                  >
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 text-romantic-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </Masonry>
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
      </div>
    </div>
  );
};

export default GalleryPage;
