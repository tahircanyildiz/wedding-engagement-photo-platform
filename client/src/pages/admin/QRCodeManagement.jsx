import { useState } from 'react';
import { qrcodeAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const QRCodeManagement = () => {
  const [qrCode, setQrCode] = useState(null);
  const [generating, setGenerating] = useState(false);

  const uploadUrl = `${window.location.origin}/upload`;

  const handleGenerateQR = async () => {
    setGenerating(true);
    try {
      const response = await qrcodeAPI.generate(uploadUrl);
      setQrCode(response.data);
      toast.success('QR kod oluşturuldu!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('QR kod oluşturulurken hata oluştu');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode.qrCode;
    link.download = 'wedding-upload-qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR kod indirildi!');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(uploadUrl);
    toast.success('URL kopyalandı!');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">QR Kod Yönetimi</h1>
        <p className="text-gray-600">Fotoğraf yükleme sayfası için QR kod oluşturun</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Code Generator */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">QR Kod Oluştur</h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Yükleme Sayfası URL:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={uploadUrl}
                readOnly
                className="input-field flex-1 bg-white"
              />
              <button
                onClick={handleCopyUrl}
                className="btn-secondary whitespace-nowrap"
              >
                Kopyala
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerateQR}
            disabled={generating}
            className="btn-primary w-full disabled:opacity-50"
          >
            {generating ? 'Oluşturuluyor...' : 'QR Kod Oluştur'}
          </button>

          {qrCode && (
            <div className="mt-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
                <img
                  src={qrCode.qrCode}
                  alt="QR Code"
                  className="w-64 h-64 mx-auto mb-4"
                />
                <button
                  onClick={handleDownload}
                  className="btn-primary"
                >
                  QR Kodu İndir
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Nasıl Kullanılır?</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-romantic-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">QR Kod Oluştur</h3>
                <p className="text-gray-600 text-sm">
                  Yukarıdaki butona tıklayarak fotoğraf yükleme sayfası için QR kod oluşturun.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-romantic-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">QR Kodu İndir</h3>
                <p className="text-gray-600 text-sm">
                  Oluşturulan QR kodu PNG formatında bilgisayarınıza indirin.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-romantic-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Yazdır ve Paylaş</h3>
                <p className="text-gray-600 text-sm">
                  QR kodu yazdırıp düğün mekanınıza yerleştirin veya davetiyelerinize ekleyin.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-romantic-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Misafirler Tarasın</h3>
                <p className="text-gray-600 text-sm">
                  Misafirleriniz QR kodu telefonlarıyla tarayarak fotoğraf yükleme sayfasına ulaşabilir.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-romantic-50 border border-romantic-200 rounded-lg">
            <h3 className="font-bold text-romantic-700 mb-2 flex items-center gap-2">
              <span>💡</span>
              İpucu
            </h3>
            <p className="text-sm text-gray-700">
              QR kodu masalara, menü kartlarına veya düğün alanının girişine yerleştirerek
              misafirlerinizin kolayca fotoğraf yüklemesini sağlayabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      {qrCode && (
        <div className="card mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">QR Kod Önizleme</h2>
          <div className="bg-gradient-to-br from-pastel-pink via-pastel-lavender to-pastel-peach p-8 rounded-lg">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-auto text-center">
              <h3 className="text-2xl font-elegant font-bold text-romantic-700 mb-2">
                {qrCode.eventInfo?.couple_names || 'Düğünümüz'}
              </h3>
              <p className="text-gray-600 mb-6">Fotoğraflarınızı Paylaşın</p>
              <img
                src={qrCode.qrCode}
                alt="QR Code Preview"
                className="w-48 h-48 mx-auto mb-4"
              />
              <p className="text-sm text-gray-600">
                QR kodu tarayarak fotoğraf yükleyin
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeManagement;
