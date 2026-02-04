import { useState, useEffect } from 'react';
import { settingsAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const Settings = () => {
  const [settings, setSettings] = useState({
    upload_enabled: true,
    gallery_filter_enabled: true,
    memory_filter_enabled: true,
    memory_enabled: true,
    event_info: {
      couple_names: '',
      date: '',
      venue_name: '',
      location: '',
      maps_url: '',
      description: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.get();
      setSettings({
        ...response.data,
        event_info: {
          ...response.data.event_info,
          date: response.data.event_info.date
            ? new Date(response.data.event_info.date).toISOString().split('T')[0]
            : ''
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await settingsAPI.update(settings);
      toast.success('Ayarlar kaydedildi!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleEventInfoChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      event_info: {
        ...prev.event_info,
        [field]: value
      }
    }));
  };

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ayarlar</h1>
        <p className="text-gray-600">Etkinlik bilgilerini ve genel ayarları düzenleyin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Etkinlik Bilgileri</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çift İsimleri
              </label>
              <input
                type="text"
                value={settings.event_info.couple_names}
                onChange={(e) => handleEventInfoChange('couple_names', e.target.value)}
                className="input-field"
                placeholder="Ayşe & Mehmet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etkinlik Tarihi
              </label>
              <input
                type="date"
                value={settings.event_info.date}
                onChange={(e) => handleEventInfoChange('date', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mekan Adı
              </label>
              <input
                type="text"
                value={settings.event_info.venue_name}
                onChange={(e) => handleEventInfoChange('venue_name', e.target.value)}
                className="input-field"
                placeholder="Grand Düğün Salonu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mekan Adresi
              </label>
              <input
                type="text"
                value={settings.event_info.location}
                onChange={(e) => handleEventInfoChange('location', e.target.value)}
                className="input-field"
                placeholder="Bağdat Caddesi No:123, Kadıköy, İstanbul"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Maps Linki
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={settings.event_info.maps_url}
                  onChange={(e) => handleEventInfoChange('maps_url', e.target.value)}
                  className="input-field pl-10"
                  placeholder="https://maps.google.com/..."
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Google Maps'ten mekanı arayıp "Paylaş" butonundan linki kopyalayın
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={settings.event_info.description}
                onChange={(e) => handleEventInfoChange('description', e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Mutluluğumuzu sizinle paylaşmak istiyoruz!"
              />
            </div>
          </div>
        </div>

        {/* Upload & Gallery Settings */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Genel Ayarlar</h2>

          <div className="space-y-4">
            {/* Upload Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Fotoğraf Yükleme</h3>
                <p className="text-sm text-gray-600">
                  Kullanıcıların fotoğraf yüklemesine izin ver
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({
                  ...prev,
                  upload_enabled: !prev.upload_enabled
                }))}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  settings.upload_enabled ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.upload_enabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Gallery Filter Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Galeri Filtreleme</h3>
                <p className="text-sm text-gray-600">
                  Galeri sayfasında fotoğraf filtreleme özelliğini göster
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({
                  ...prev,
                  gallery_filter_enabled: !prev.gallery_filter_enabled
                }))}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  settings.gallery_filter_enabled ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.gallery_filter_enabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Memory Filter Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Anı Defteri Filtreleme</h3>
                <p className="text-sm text-gray-600">
                  Anı defterinde filtreleme özelliğini göster
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({
                  ...prev,
                  memory_filter_enabled: !prev.memory_filter_enabled
                }))}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  settings.memory_filter_enabled ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.memory_filter_enabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Memory Enabled Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Anı Ekleme</h3>
                <p className="text-sm text-gray-600">
                  Kullanıcıların yeni anı eklemesine izin ver
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({
                  ...prev,
                  memory_enabled: !prev.memory_enabled
                }))}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  settings.memory_enabled ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.memory_enabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-lg px-8 disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      </form>

      {/* Preview */}
      <div className="card mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Anasayfa Önizlemesi</h2>
        <div className="bg-gradient-to-br from-pastel-pink via-pastel-lavender to-pastel-peach p-8 rounded-lg">
          <div className="text-center">
            <h1 className="text-5xl font-elegant font-bold text-romantic-700 mb-4">
              {settings.event_info.couple_names || 'Çift İsimleri'}
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-600 mb-4">
              <div className="h-px w-16 bg-romantic-400"></div>
              <p className="text-xl">
                {settings.event_info.date
                  ? new Date(settings.event_info.date).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'Tarih'}
              </p>
              <div className="h-px w-16 bg-romantic-400"></div>
            </div>
            {(settings.event_info.venue_name || settings.event_info.location) && (
              <div className="mb-4">
                {settings.event_info.venue_name && (
                  <p className="text-lg font-semibold text-gray-700">{settings.event_info.venue_name}</p>
                )}
                {settings.event_info.location && (
                  <p className="text-gray-500 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4 text-romantic-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {settings.event_info.location}
                  </p>
                )}
              </div>
            )}
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              {settings.event_info.description || 'Açıklama'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
