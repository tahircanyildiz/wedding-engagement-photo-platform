import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { photosAPI, settingsAPI, uploadToCloudinary } from '../utils/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const UploadPage = () => {
  const [uploaderName, setUploaderName] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadEnabled, setUploadEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

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

  const onDrop = useCallback((acceptedFiles) => {
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length !== acceptedFiles.length) {
      toast.warning('Sadece resim dosyaları kabul edilir');
    }

    setFiles(prev => [...prev, ...imageFiles]);

    // Create previews
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, {
          file,
          preview: reader.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uploaderName.trim()) {
      toast.error('Lütfen isminizi girin');
      return;
    }

    if (files.length === 0) {
      toast.error('Lütfen en az bir fotoğraf seçin');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedPhotos = [];

      // Dosyaları SIRAYLA yükle (mobil için daha güvenilir)
      for (let i = 0; i < files.length; i++) {
        try {
          const photo = await uploadToCloudinary(files[i]);
          uploadedPhotos.push(photo);
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        } catch (uploadError) {
          console.error(`File ${i + 1} upload error:`, uploadError);
          // Kullanıcıya hangi dosyada hata olduğunu söyle
          toast.error(`${i + 1}. fotoğraf yüklenemedi: ${uploadError.message || 'Bilinmeyen hata'}`);
          // Diğer dosyalara devam et
          continue;
        }
      }

      // En az bir fotoğraf yüklendiyse kaydet
      if (uploadedPhotos.length > 0) {
        await photosAPI.upload({
          photos: uploadedPhotos,
          uploader_name: uploaderName.trim()
        });

        if (uploadedPhotos.length === files.length) {
          toast.success(`Teşekkürler ${uploaderName.trim()}! ${files.length} fotoğraf başarıyla yüklendi`);
        } else {
          toast.warning(`${uploadedPhotos.length}/${files.length} fotoğraf yüklendi`);
        }

        // Reset form
        setFiles([]);
        setPreviews([]);
        setUploaderName('');
        setUploadProgress(0);
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-romantic-600"></div>
      </div>
    );
  }

  if (!uploadEnabled) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-3xl font-bold text-gray-700 mb-4">
                Fotoğraf Yükleme Kapalı
              </h2>
              <p className="text-gray-600 text-lg">
                Fotoğraf yükleme şu an kapalıdır. Lütfen daha sonra tekrar deneyin.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-elegant font-bold text-romantic-700 mb-4">
              Fotoğraf Yükle
            </h1>
            <p className="text-gray-600 text-lg">
              Nişandan çektiğiniz fotoğrafları bizimle paylaşın
            </p>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8">
            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adınız <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Adınız"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                className="input-field"
                required
                disabled={uploading}
              />
            </div>

            {/* Dropzone */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotoğraflar <span className="text-red-500">*</span>
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-romantic-600 bg-romantic-50'
                    : 'border-gray-300 hover:border-romantic-400'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...getInputProps()} disabled={uploading} />
                <div className="text-6xl mb-4">📤</div>
                {isDragActive ? (
                  <p className="text-romantic-600 font-medium text-lg">
                    Fotoğrafları buraya bırakın...
                  </p>
                ) : (
                  <>
                    <p className="text-gray-700 font-medium text-lg mb-2">
                      Fotoğrafları sürükleyip bırakın
                    </p>
                    <p className="text-gray-500">veya tıklayarak dosya seçin</p>
                  </>
                )}
              </div>
            </div>

            {/* Preview Grid */}
            {previews.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Önizleme ({previews.length} fotoğraf)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previews.map((item, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={item.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={uploading}
                      >
                        <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {uploading && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>Yükleniyor...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-romantic-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || files.length === 0 || !uploaderName.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {uploading ? 'Yükleniyor...' : `${files.length} Fotoğraf Yükle`}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              Yüklediğiniz fotoğraflar herkese açık olarak paylaşılacaktır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
