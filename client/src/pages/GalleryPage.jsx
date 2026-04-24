import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { photosAPI, settingsAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Masonry from 'react-masonry-css';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const LIMIT = 20;

const optimizeCloudinaryUrl = (url, type = 'thumbnail') => {
  if (!url || !url.includes('cloudinary.com')) return url;
  const transforms = {
    thumbnail: 'w_400,h_400,c_fill,q_auto,f_auto',
    full: 'q_auto,f_auto',
  };
  return url.replace('/upload/', `/upload/${transforms[type]}/`);
};

const getLikedPhotos = () => {
  try { return new Set(JSON.parse(localStorage.getItem('likedPhotos') || '[]')); }
  catch { return new Set(); }
};
const saveLikedPhotos = (set) => {
  localStorage.setItem('likedPhotos', JSON.stringify([...set]));
};

const GalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [filterUploader, setFilterUploader] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [likedPhotos, setLikedPhotos] = useState(getLikedPhotos);
  const loaderRef = useRef(null);

  const filterEnabled = settings?.gallery_filter_enabled !== false;

  // İlk yükleme (sort veya filter değişince sıfırla)
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setPhotos([]);
      setPage(1);
      setHasMore(true);
      try {
        const [settingsRes, photosRes] = await Promise.all([
          settingsAPI.get(),
          photosAPI.getAll({ sort: sortBy, uploader: filterUploader || undefined, page: 1, limit: LIMIT }),
        ]);
        setSettings(settingsRes.data);
        setPhotos(photosRes.data.photos);
        setHasMore(photosRes.data.hasMore);
      } catch {
        toast.error('Veriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [sortBy, filterUploader]);

  // Daha fazla yükle
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await photosAPI.getAll({ sort: sortBy, uploader: filterUploader || undefined, page: nextPage, limit: LIMIT });
      setPhotos(prev => [...prev, ...res.data.photos]);
      setHasMore(res.data.hasMore);
      setPage(nextPage);
    } catch {
      toast.error('Daha fazla fotoğraf yüklenemedi');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, sortBy, filterUploader]);

  // IntersectionObserver — sayfa sonuna yaklaşınca loadMore
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const handlePhotoClick = (index) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handleDownload = useCallback(async (url, uploaderName) => {
    try {
      const response = await fetch(optimizeCloudinaryUrl(url, 'full'));
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `nisanfoto-${uploaderName}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch {
      toast.error('Fotoğraf indirilemedi');
    }
  }, []);

  const handleShare = useCallback(async (photo) => {
    const url = photo.cloudinary_url;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${photo.uploader_name} tarafından paylaşıldı`, url });
      } catch (e) {
        if (e.name !== 'AbortError') toast.error('Paylaşım başarısız');
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link panoya kopyalandı');
      } catch {
        toast.error('Link kopyalanamadı');
      }
    }
  }, []);

  const handleLike = useCallback(async (e, photoId) => {
    e.stopPropagation();
    if (likedPhotos.has(photoId)) return;
    try {
      const res = await photosAPI.like(photoId);
      setPhotos(prev => prev.map(p => p._id === photoId ? { ...p, likes: res.data.likes } : p));
      const updated = new Set(likedPhotos);
      updated.add(photoId);
      setLikedPhotos(updated);
      saveLikedPhotos(updated);
    } catch {
      toast.error('Beğeni kaydedilemedi');
    }
  }, [likedPhotos]);

  const lightboxSlides = useMemo(() =>
    photos.map(photo => ({
      src: optimizeCloudinaryUrl(photo.cloudinary_url, 'full'),
      title: photo.uploader_name,
      description: format(new Date(photo.upload_date), 'dd MMMM yyyy, HH:mm', { locale: tr }),
    })), [photos]);

  const breakpointColumns = { default: 4, 1280: 3, 768: 2, 640: 2 };

  if (loading || !settings) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 pb-28 md:pb-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-elegant font-bold text-romantic-700 mb-2">Fotoğraf Galerisi</h1>
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
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-elegant font-bold text-romantic-700 mb-1">Fotoğraf Galerisi</h1>
            <p className="text-gray-500 text-sm md:text-lg">{photos.length} fotoğraf yüklendi</p>
          </div>

          {filterEnabled && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-6">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sıralama</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field text-sm">
                    <option value="newest">En Yeni</option>
                    <option value="oldest">En Eski</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kişiye Göre</label>
                  <input
                    type="text"
                    placeholder="İsim ile ara..."
                    value={filterUploader}
                    onChange={(e) => setFilterUploader(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {photos.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                {filterUploader ? 'Fotoğraf bulunamadı' : 'Henüz fotoğraf yok'}
              </h3>
              <p className="text-gray-500">
                {filterUploader ? 'Bu filtreye uygun fotoğraf yok' : 'İlk fotoğrafı sen yükle!'}
              </p>
            </div>
          )}

          {photos.length > 0 && (
            <Masonry breakpointCols={breakpointColumns} className="flex -ml-3 w-auto" columnClassName="pl-3 bg-clip-padding">
              {photos.map((photo, index) => {
                const isLiked = likedPhotos.has(photo._id);
                return (
                  <div
                    key={photo._id}
                    className="mb-3 group cursor-pointer relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                    onClick={() => handlePhotoClick(index)}
                  >
                    <img
                      src={optimizeCloudinaryUrl(photo.cloudinary_url, 'thumbnail')}
                      alt={`Yükleyen: ${photo.uploader_name}`}
                      className="w-full h-auto block group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Alt gradient — mobilde her zaman görünür */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 text-white">
                        <p className="font-semibold text-sm leading-tight truncate">{photo.uploader_name}</p>
                      </div>
                    </div>

                    {/* Aksiyon butonları — sağ alt */}
                    <div className="absolute bottom-2 right-2 flex gap-1.5">
                      {/* Beğeni */}
                      <button
                        onClick={(e) => handleLike(e, photo._id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-lg transition-all ${
                          isLiked
                            ? 'bg-romantic-600 text-white'
                            : 'bg-white/90 text-gray-700 hover:bg-romantic-50 md:opacity-0 md:group-hover:opacity-100'
                        }`}
                        title={isLiked ? 'Beğenildi' : 'Beğen'}
                      >
                        <svg className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {(photo.likes || 0) > 0 && <span>{photo.likes}</span>}
                      </button>

                      {/* Paylaş */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShare(photo); }}
                        className="bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                        title="Paylaş"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>

                      {/* İndir */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(photo.cloudinary_url, photo.uploader_name); }}
                        className="bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                        title="İndir"
                      >
                        <svg className="w-3.5 h-3.5 text-romantic-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </Masonry>
          )}

          {/* Infinite scroll tetikleyici */}
          <div ref={loaderRef} className="py-6 flex justify-center">
            {loadingMore && (
              <div className="animate-spin rounded-full h-8 w-8 border-t-3 border-romantic-600 border-2"></div>
            )}
            {!hasMore && photos.length > 0 && (
              <p className="text-gray-400 text-sm">Tüm fotoğraflar yüklendi</p>
            )}
          </div>
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={currentPhotoIndex}
        slides={lightboxSlides}
        carousel={{ finite: false }}
      />
    </div>
  );
};

export default GalleryPage;
