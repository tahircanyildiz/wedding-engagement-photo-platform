import { Link } from 'react-router-dom';
import { useCallback } from 'react';

// Sayfa modüllerini önceden yükle
const preloadPages = {
  gallery: () => import('../pages/GalleryPage'),
  upload: () => import('../pages/UploadPage'),
  memories: () => import('../pages/MemoryBookPage'),
};

const Navbar = ({ transparent = false }) => {
  // Link üzerine gelindiğinde sayfayı preload et
  const handlePreload = useCallback((page) => {
    if (preloadPages[page]) {
      preloadPages[page]();
    }
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md shadow-md'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-elegant font-bold text-romantic-600">
            Nişan Anılarımız
          </Link>
          <div className="flex gap-4 sm:gap-6">
            <Link
              to="/gallery"
              onMouseEnter={() => handlePreload('gallery')}
              className="text-gray-700 hover:text-romantic-600 transition-colors font-medium text-sm sm:text-base"
            >
              Galeri
            </Link>
            <Link
              to="/upload"
              onMouseEnter={() => handlePreload('upload')}
              className="text-gray-700 hover:text-romantic-600 transition-colors font-medium text-sm sm:text-base"
            >
              Fotoğraf Yükle
            </Link>
            <Link
              to="/memories"
              onMouseEnter={() => handlePreload('memories')}
              className="text-gray-700 hover:text-romantic-600 transition-colors font-medium text-sm sm:text-base"
            >
              Anı Defteri
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
