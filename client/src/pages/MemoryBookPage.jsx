import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const MemoryBookPage = () => {
  const [memories, setMemories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: '',
    message: ''
  });

  // Settings sadece ilk mount'ta yükle
  useEffect(() => {
    fetchSettings();
  }, []);

  // Memories sortBy değiştiğinde yeniden yükle
  useEffect(() => {
    if (settings) {
      fetchMemories();
    }
  }, [sortBy, settings]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/memories?sort=${sortBy}`);
      const data = await response.json();
      setMemories(data);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast.error('Anılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.guest_name.trim()) {
      toast.error('Lütfen isminizi girin');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Lütfen anınızı yazın');
      return;
    }

    if (formData.message.trim().length < 10) {
      toast.error('Anınız en az 10 karakter olmalıdır');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Hata oluştu');
      }

      toast.success('Anınız paylaşıldı! Teşekkür ederiz 💕');
      setFormData({ guest_name: '', message: '' });
      setIsModalOpen(false);
      fetchMemories();
    } catch (error) {
      console.error('Error submitting memory:', error);
      toast.error(error.message || 'Anı kaydedilirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const filterEnabled = settings?.memory_filter_enabled !== false;
  const memoryEnabled = settings?.memory_enabled !== false;

  // Don't render until settings are loaded to prevent flash
  if (!settings) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-romantic-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header with Add Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl sm:text-5xl font-elegant font-bold text-romantic-700 mb-2 flex items-center gap-3 justify-center sm:justify-start">
                📖 Anı Defteri
              </h1>
              <p className="text-gray-600">
                {memories.length} anı paylaşıldı
              </p>
            </div>

            <button
              onClick={() => memoryEnabled && setIsModalOpen(true)}
              disabled={!memoryEnabled}
              className={`text-lg px-6 py-3 flex items-center gap-2 shadow-lg transition-all ${
                memoryEnabled
                  ? 'btn-primary hover:shadow-xl'
                  : 'bg-gray-400 text-white cursor-not-allowed opacity-75'
              }`}
            >
              {memoryEnabled ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Anı Ekle
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Anı Ekleme Kapalı
                </>
              )}
            </button>
          </div>

          {/* Filter */}
          {filterEnabled && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-4 mb-8">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Sıralama:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field flex-1 sm:flex-none"
                >
                  <option value="newest">En Yeni</option>
                  <option value="oldest">En Eski</option>
                </select>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-romantic-600"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && memories.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
              <div className="text-8xl mb-6">📝</div>
              <h3 className="text-3xl font-bold text-gray-700 mb-3">
                {memoryEnabled ? 'İlk anıyı sen paylaş!' : 'Henüz anı yok'}
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                {memoryEnabled
                  ? 'Nişanımızla ilgili anılarını ve iyi dileklerini bizimle paylaş'
                  : 'Anı ekleme şu anda kapalı'}
              </p>
              {memoryEnabled && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary text-lg px-8 py-3"
                >
                  Anı Ekle
                </button>
              )}
            </div>
          )}

          {/* Memories Grid */}
          {!loading && memories.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {memories.map((memory, index) => (
                <div
                  key={memory._id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-transparent hover:border-romantic-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-romantic-400 via-romantic-500 to-romantic-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {memory.guest_name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-xl text-gray-800 truncate">
                          {memory.guest_name}
                        </h3>
                      </div>

                      <div className="mb-3 p-4 bg-gradient-to-br from-romantic-50 to-pastel-lavender rounded-xl">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                          "{memory.message}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {format(new Date(memory.created_at), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Memory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-elegant font-bold text-romantic-700">
                ✨ Anını Paylaş
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-romantic-50 to-pastel-lavender p-4 rounded-xl">
                <p className="text-gray-700 text-sm leading-relaxed">
                  💕 Nişanımızla ilgili anılarınızı, iyi dileklerinizi ve özel mesajlarınızı bizimle paylaşın.
                  Her bir anınız bizim için çok değerli!
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  İsminiz <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                  className="input-field text-lg"
                  placeholder="Adınız Soyadınız"
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Anınız / İyi Dilekleriniz <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-field text-lg resize-none"
                  rows="6"
                  placeholder="Nişanımızla ilgili anılarınızı, duygularınızı veya iyi dileklerinizi paylaşın..."
                  disabled={submitting}
                  required
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    Minimum 10 karakter
                  </p>
                  <p className={`text-sm font-medium ${
                    formData.message.length >= 10 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {formData.message.length} karakter
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || formData.message.length < 10}
                  className="flex-1 btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Paylaş 💕
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 sm:flex-none btn-secondary text-lg py-3 disabled:opacity-50"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MemoryBookPage;
