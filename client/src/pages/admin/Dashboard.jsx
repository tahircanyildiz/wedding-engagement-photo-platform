import { useState, useEffect } from 'react';
import { photosAPI, settingsAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [uploadEnabled, setUploadEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, settingsResponse] = await Promise.all([
        photosAPI.getStats(),
        settingsAPI.get()
      ]);
      setStats(statsResponse.data);
      setUploadEnabled(settingsResponse.data.upload_enabled);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUpload = async () => {
    setToggling(true);
    try {
      const response = await settingsAPI.toggleUpload();
      setUploadEnabled(response.data.upload_enabled);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error toggling upload:', error);
      toast.error('Ayar değiştirilirken hata oluştu');
    } finally {
      setToggling(false);
    }
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Genel bakış ve istatistikler</p>
      </div>

      {/* Upload Status Toggle */}
      <div className="card mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Fotoğraf Yükleme Durumu</h3>
          <p className="text-gray-600">
            Yükleme şu an <span className={uploadEnabled ? 'text-green-600' : 'text-red-600'}>
              {uploadEnabled ? 'açık' : 'kapalı'}
            </span>
          </p>
        </div>
        <button
          onClick={handleToggleUpload}
          disabled={toggling}
          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
            uploadEnabled ? 'bg-green-600' : 'bg-gray-300'
          } ${toggling ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              uploadEnabled ? 'translate-x-9' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-3xl mb-2">📸</div>
          <h3 className="text-gray-600 text-sm mb-1">Toplam Fotoğraf</h3>
          <p className="text-3xl font-bold text-romantic-600">{stats?.totalPhotos || 0}</p>
        </div>

        <div className="card">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-gray-600 text-sm mb-1">Katkıda Bulunan</h3>
          <p className="text-3xl font-bold text-romantic-600">{stats?.totalUploaders || 0}</p>
        </div>

        <div className="card">
          <div className="text-3xl mb-2">⭐</div>
          <h3 className="text-gray-600 text-sm mb-1">Ortalama Katkı</h3>
          <p className="text-3xl font-bold text-romantic-600">
            {stats?.totalUploaders > 0
              ? Math.round(stats.totalPhotos / stats.totalUploaders)
              : 0}
          </p>
        </div>

        <div className="card">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="text-gray-600 text-sm mb-1">En Aktif Kullanıcı</h3>
          <p className="text-lg font-bold text-romantic-600 truncate">
            {stats?.topUploaders?.[0]?._id || '-'}
          </p>
          <p className="text-sm text-gray-500">
            {stats?.topUploaders?.[0]?.count || 0} fotoğraf
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Uploaders */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">En Çok Fotoğraf Yükleyen 5 Kişi</h2>
          <div className="space-y-3">
            {stats?.topUploaders?.slice(0, 5).map((uploader, index) => (
              <div key={uploader._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-romantic-600">#{index + 1}</span>
                  <span className="font-medium text-gray-800">{uploader._id}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">{uploader.count} fotoğraf</span>
              </div>
            ))}
            {(!stats?.topUploaders || stats.topUploaders.length === 0) && (
              <p className="text-gray-500 text-center py-4">Henüz fotoğraf yüklenmemiş</p>
            )}
          </div>
        </div>

        {/* Recent Photos */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Son Yüklenen Fotoğraflar</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats?.recentPhotos?.map((photo) => (
              <div key={photo._id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={photo.cloudinary_url}
                  alt={photo.uploader_name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{photo.uploader_name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(photo.upload_date), 'dd MMM yyyy, HH:mm', { locale: tr })}
                  </p>
                </div>
              </div>
            ))}
            {(!stats?.recentPhotos || stats.recentPhotos.length === 0) && (
              <p className="text-gray-500 text-center py-4">Henüz fotoğraf yüklenmemiş</p>
            )}
          </div>
        </div>
      </div>

      {/* Upload Statistics */}
      <div className="card mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Kullanıcı Bazında İstatistikler</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kullanıcı Adı</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Fotoğraf Sayısı</th>
              </tr>
            </thead>
            <tbody>
              {stats?.uploaderStats?.map((stat, index) => (
                <tr key={stat._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{stat._id}</td>
                  <td className="text-right py-3 px-4 font-medium text-romantic-600">{stat.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!stats?.uploaderStats || stats.uploaderStats.length === 0) && (
            <p className="text-gray-500 text-center py-8">Henüz veri yok</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
