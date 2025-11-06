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
  const [formData, setFormData] = useState({
    guest_name: '',
    message: ''
  });

  useEffect(() => {
    fetchSettings();
    fetchMemories();
  }, [sortBy]);

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
      fetchMemories();
    } catch (error) {
      console.error('Error submitting memory:', error);
      toast.error(error.message || 'Anı kaydedilirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const filterEnabled = settings?.memory_filter_enabled !== false;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-elegant font-bold text-romantic-700 mb-4">
              📖 Anı Defteri
            </h1>
            <p className="text-gray-600 text-lg">
              Nişanımızla ilgili anılarınızı ve iyi dileklerinizi bizimle paylaşın
            </p>
          </div>

          {/* Memory Form */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Anını Paylaş</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İsminiz <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guest_name}
                  onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                  className="input-field"
                  placeholder="Adınız Soyadınız"
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anınız / İyi Dilekleriniz <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-field"
                  rows="4"
                  placeholder="Nişanınızla ilgili anılarınızı veya iyi dileklerinizi paylaşın..."
                  disabled={submitting}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum 10 karakter
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Kaydediliyor...' : 'Anımı Paylaş 💕'}
              </button>
            </form>
          </div>

          {/* Filter */}
          {filterEnabled && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-4">
                <label className="block text-sm font-medium text-gray-700">
                  Sıralama:
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
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                Henüz anı yok
              </h3>
              <p className="text-gray-600">
                İlk anıyı sen paylaş!
              </p>
            </div>
          )}

          {/* Memories List */}
          {!loading && memories.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Paylaşılan Anılar ({memories.length})
              </h2>

              {memories.map((memory) => (
                <div
                  key={memory._id}
                  className="card hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-romantic-400 to-romantic-600 flex items-center justify-center text-white font-bold text-xl">
                        {memory.guest_name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-800">
                          {memory.guest_name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {format(new Date(memory.created_at), 'dd MMM yyyy, HH:mm', { locale: tr })}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {memory.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryBookPage;
