import { Link, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

const preloadPages = {
  gallery: () => import('../pages/GalleryPage'),
  upload: () => import('../pages/UploadPage'),
  memories: () => import('../pages/MemoryBookPage'),
};

const Navbar = ({ transparent = false }) => {
  const location = useLocation();
  const path = location.pathname;

  const handlePreload = useCallback((page) => {
    if (preloadPages[page]) preloadPages[page]();
  }, []);

  const isActive = (href) => path === href;

  return (
    <>
      {/* Top bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md shadow-md'}`}>
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl md:text-2xl font-elegant font-bold text-romantic-600">
              Nişan Anılarımız
            </Link>
            {/* Desktop nav links */}
            <div className="hidden md:flex gap-6">
              <Link
                to="/gallery"
                onMouseEnter={() => handlePreload('gallery')}
                className={`font-medium transition-colors ${isActive('/gallery') ? 'text-romantic-600' : 'text-gray-700 hover:text-romantic-600'}`}
              >
                Galeri
              </Link>
              <Link
                to="/upload"
                onMouseEnter={() => handlePreload('upload')}
                className={`font-medium transition-colors ${isActive('/upload') ? 'text-romantic-600' : 'text-gray-700 hover:text-romantic-600'}`}
              >
                Fotoğraf Yükle
              </Link>
              <Link
                to="/memories"
                onMouseEnter={() => handlePreload('memories')}
                className={`font-medium transition-colors ${isActive('/memories') ? 'text-romantic-600' : 'text-gray-700 hover:text-romantic-600'}`}
              >
                Anı Defteri
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl">
        <div className="flex justify-around items-end px-2 pt-2 pb-safe">
          {/* Ana Sayfa */}
          <Link to="/" className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${isActive('/') ? 'text-romantic-600' : 'text-gray-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/') ? 2.5 : 1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium">Ana Sayfa</span>
          </Link>

          {/* Galeri */}
          <Link
            to="/gallery"
            onTouchStart={() => handlePreload('gallery')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${isActive('/gallery') ? 'text-romantic-600' : 'text-gray-500'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/gallery') ? 2.5 : 1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-medium">Galeri</span>
          </Link>

          {/* Yükle - center FAB */}
          <Link
            to="/upload"
            onTouchStart={() => handlePreload('upload')}
            className="flex flex-col items-center gap-0.5 -mt-5"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${isActive('/upload') ? 'bg-romantic-700 scale-95' : 'bg-romantic-600'}`}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className={`text-[10px] font-medium mt-0.5 ${isActive('/upload') ? 'text-romantic-600' : 'text-gray-500'}`}>Yükle</span>
          </Link>

          {/* Anı Defteri */}
          <Link
            to="/memories"
            onTouchStart={() => handlePreload('memories')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${isActive('/memories') ? 'text-romantic-600' : 'text-gray-500'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/memories') ? 2.5 : 1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[10px] font-medium">Anı Defteri</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
