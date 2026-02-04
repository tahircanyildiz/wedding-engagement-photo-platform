import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsAPI } from '../utils/api';
import Countdown from '../components/Countdown';
import { toast } from 'react-toastify';

const HomePage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-romantic-600"></div>
      </div>
    );
  }

  const eventInfo = settings?.event_info || {};

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-romantic-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-pastel-lavender/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pastel-peach/20 rounded-full blur-2xl animate-pulse delay-500"></div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Names */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-elegant font-bold text-romantic-700 mb-4 flex flex-col md:flex-row md:gap-4 justify-center items-center">
              {(eventInfo.couple_names || 'Tahir & Özge').split(' ').map((word, index) => (
                <span key={index} className="whitespace-nowrap">{word}</span>
              ))}
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-600">
              <div className="h-px w-16 bg-romantic-400"></div>
              <p className="text-xl md:text-2xl font-light tracking-wide">
                {eventInfo.date ? new Date(eventInfo.date).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : 'Yakında'}
              </p>
              <div className="h-px w-16 bg-romantic-400"></div>
            </div>
            {(eventInfo.venue_name || eventInfo.location) && (
              <div className="mt-4">
                {eventInfo.venue_name && (
                  <p className="text-lg font-semibold text-gray-700">
                    {eventInfo.venue_name}
                  </p>
                )}
                {eventInfo.location && (
                  eventInfo.maps_url ? (
                    <a
                      href={eventInfo.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-gray-500 hover:text-romantic-600 transition-colors mt-1 group"
                    >
                      <svg
                        className="w-5 h-5 text-romantic-500 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="underline underline-offset-2">{eventInfo.location}</span>
                    </a>
                  ) : (
                    <p className="inline-flex items-center gap-1 text-gray-500 mt-1">
                      <svg
                        className="w-5 h-5 text-romantic-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {eventInfo.location}
                    </p>
                  )
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 font-light leading-relaxed">
            {eventInfo.description || 'Mutluluğumuzu sizinle paylaşmak istiyoruz!'}
          </p>

          {/* Countdown */}
          {eventInfo.date && new Date(eventInfo.date) > new Date() && (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-elegant text-romantic-600 mb-6">
                Büyük Güne Kalan Süre
              </h2>
              <Countdown targetDate={eventInfo.date} />
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button
              onClick={() => navigate('/gallery')}
              className="btn-primary text-lg px-8 py-4 transform hover:scale-105 transition-transform"
            >
              📸 Fotoğrafları Gör
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="btn-secondary text-lg px-8 py-4 transform hover:scale-105 transition-transform"
            >
              ⬆️ Fotoğraf Yükle
            </button>
            <button
              onClick={() => navigate('/memories')}
              className="btn-secondary text-lg px-8 py-4 transform hover:scale-105 transition-transform"
            >
              📖 Anı Defteri
            </button>
          </div>

          {/* Hearts Animation */}
          <div className="mt-16 text-6xl animate-pulse">
            💕
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-romantic-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      {/* Info Section */}
      <div className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-elegant font-bold text-romantic-700 mb-6">
            Anılarımızı Paylaşın
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Nişanımızda çektiğiniz fotoğrafları bizimle paylaşarak bu özel günü
            ölümsüzleştirmemize yardımcı olabilirsiniz. Tüm fotoğraflar galerimizde
            toplanacak ve herkes tarafından görülebilecek.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-romantic-600 mb-2">Fotoğraf Çekin</h3>
              <p className="text-gray-600">Özel anları yakalayın</p>
            </div>
            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">⬆️</div>
              <h3 className="text-xl font-bold text-romantic-600 mb-2">Yükleyin</h3>
              <p className="text-gray-600">QR kod ile kolayca yükleyin</p>
            </div>
            <div className="card text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-romantic-600 mb-2">Paylaşın</h3>
              <p className="text-gray-600">Anıları birlikte yaşayın</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
