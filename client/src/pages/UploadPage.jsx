import { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { photosAPI, settingsAPI, uploadToCloudinary } from '../utils/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const STORAGE_KEY = 'uploader_name';

const UploadPage = () => {
  const [uploaderName, setUploaderName] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadEnabled, setUploadEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const nameInputRef = useRef(null);
  const uploaderNameRef = useRef(uploaderName);

  useEffect(() => {
    uploaderNameRef.current = uploaderName;
  }, [uploaderName]);

  useEffect(() => {
    checkUploadStatus();
  }, []);

  const checkUploadStatus = async () => {
    try {
      const response = await settingsAPI.get();
      setUploadEnabled(response.data.upload_enabled);
    } catch (error) {
      console.error('Error checking upload status:', error);
      toast.error('Ayarlar kontrol edilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setUploaderName(val);
    localStorage.setItem(STORAGE_KEY, val);
  };

  const startUpload = useCallback(async (filesToUpload, name) => {
    setUploading(true);
    setUploadProgress({ current: 0, total: filesToUpload.length });

    try {
      const uploadedPhotos = [];
      const CONCURRENCY = 3;

      await new Promise((resolve) => {
        let started = 0;
        let finished = 0;

        const startNext = () => {
          while (started < filesToUpload.length && started - finished < CONCURRENCY) {
            const index = started++;
            uploadToCloudinary(filesToUpload[index])
              .then((result) => { uploadedPhotos.push(result); })
              .catch((err) => {
                console.error(`File ${index + 1} upload error:`, err);
                toast.error(`${index + 1}. fotoğraf yüklenemedi`);
              })
              .finally(() => {
                finished++;
                setUploadProgress({ current: finished, total: filesToUpload.length });
                if (finished === filesToUpload.length) resolve();
                else startNext();
              });
          }
        };

        startNext();
      });

      if (uploadedPhotos.length > 0) {
        await photosAPI.upload({
          photos: uploadedPhotos,
          uploader_name: name.trim(),
        });

        if (uploadedPhotos.length === filesToUpload.length) {
          toast.success(`Teşekkürler ${name.trim()}! ${filesToUpload.length} fotoğraf yüklendi 🎉`);
        } else {
          toast.warning(`${uploadedPhotos.length}/${filesToUpload.length} fotoğraf yüklendi`);
        }

        setPreviews([]);
        setUploadProgress({ current: 0, total: 0 });
      } else {
        toast.error('Hiçbir fotoğraf yüklenemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response?.status === 403) {
        toast.error('Fotoğraf yükleme şu an kapalı');
        setUploadEnabled(false);
      } else {
        toast.error(error.message || 'Fotoğraflar yüklenirken hata oluştu');
      }
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== acceptedFiles.length) {
      toast.warning('Sadece resim dosyaları kabul edilir');
    }
    if (imageFiles.length === 0) return;

    const name = uploaderNameRef.current;
    if (!name.trim()) {
      toast.error('Önce adını gir');
      nameInputRef.current?.focus();
      return;
    }

    // Önizlemeleri hemen göster
    const newPreviews = imageFiles.map(file => ({ preview: URL.createObjectURL(file) }));
    setPreviews(newPreviews);

    // Tüm dosyaları belleğe oku (Android izin iptali koruması)
    const memoryFiles = await Promise.all(
      imageFiles.map(async (file) => {
        try {
          const buffer = await file.arrayBuffer();
          return new File([buffer], file.name, { type: file.type });
        } catch {
          return file;
        }
      })
    );

    // Hemen yüklemeye başla
    startUpload(memoryFiles, name);
  }, [startUpload]);

  // Object URL'leri temizle
  useEffect(() => {
    return () => {
      previews.forEach(({ preview }) => {
        if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
      });
    };
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: true,
    disabled: uploading,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-romantic-600"></div>
      </div>
    );
  }

  if (!uploadEnabled) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 pb-24 md:pb-12 px-4 flex items-center justify-center min-h-screen">
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-3">Fotoğraf Yükleme Kapalı</h2>
            <p className="text-gray-500">Lütfen daha sonra tekrar deneyin.</p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = uploadProgress.total > 0
    ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-romantic-50/30 to-white">
      <Navbar />

      <div className="pt-16 pb-28 md:pb-12 px-4">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center py-6">
            <h1 className="text-3xl md:text-4xl font-elegant font-bold text-romantic-700 mb-1">
              Fotoğraf Yükle
            </h1>
            <p className="text-gray-500 text-sm">Nişandan çektiğin anları paylaş</p>
          </div>

          <div className="space-y-4">

            {/* Name Input */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Adın
              </label>
              <input
                ref={nameInputRef}
                type="text"
                placeholder="Adını gir..."
                value={uploaderName}
                onChange={handleNameChange}
                className="w-full text-base px-0 py-1 border-0 border-b-2 border-gray-200 focus:border-romantic-500 outline-none transition-colors bg-transparent placeholder-gray-300"
                disabled={uploading}
                autoComplete="name"
              />
            </div>

            {/* Photo Picker */}
            {!uploading && (
              <div
                {...getRootProps()}
                className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-romantic-200 hover:border-romantic-400 active:border-romantic-500 transition-all cursor-pointer active:scale-98"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <div className="w-16 h-16 bg-romantic-50 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-romantic-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-base mb-1">
                    Galeriden seç veya fotoğraf çek
                  </p>
                  <p className="text-gray-400 text-sm">Seçer seçmez yükleme başlar</p>
                </div>
              </div>
            )}

            {/* Yükleme sırasında önizleme + progress */}
            {uploading && (
              <>
                {previews.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="grid grid-cols-3 gap-2">
                      {previews.map((item, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={item.preview}
                            alt={`Önizleme ${index + 1}`}
                            className="w-full h-full object-cover rounded-xl"
                          />
                          {uploadProgress.current === index + 1 && (
                            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                            </div>
                          )}
                          {uploadProgress.current > index + 1 && (
                            <div className="absolute inset-0 bg-green-500/40 rounded-xl flex items-center justify-center">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {uploadProgress.current}/{uploadProgress.total} fotoğraf yükleniyor...
                    </span>
                    <span className="text-sm font-bold text-romantic-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-romantic-500 to-romantic-600 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            <p className="text-center text-xs text-gray-400 pb-2">
              Yüklediğin fotoğraflar herkese açık olarak paylaşılacak
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
