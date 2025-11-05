import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { removeToken } from '../../utils/auth';
import { authAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import Dashboard from './Dashboard';
import PhotoManagement from './PhotoManagement';
import QRCodeManagement from './QRCodeManagement';
import Settings from './Settings';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      toast.success('Çıkış yapıldı');
      navigate('/admin/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const navLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/photos', label: 'Fotoğraflar', icon: '🖼️' },
    { path: '/admin/qrcode', label: 'QR Kod', icon: '📱' },
    { path: '/admin/settings', label: 'Ayarlar', icon: '⚙️' },
    { path: '/admin/admin-settings', label: 'Admin Ayarları', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-elegant font-bold text-romantic-700">
            Admin Panel
          </h1>
          <div className="flex items-center gap-3">
            {/* Siteye Git - Mobile */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-romantic-600 hover:text-romantic-700 transition-colors"
              title="Siteye Git"
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isSidebarOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay - Mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg overflow-y-auto z-50 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-4 sm:p-6">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-elegant font-bold text-romantic-700">
              Admin Panel
            </h1>
            {/* Siteye Git Butonu - Desktop */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-romantic-600 hover:text-romantic-700 transition-colors"
              title="Siteye Git"
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>

          {/* Mobile Close Button */}
          <div className="lg:hidden flex items-center justify-between mb-6 pt-4">
            <h2 className="text-lg font-elegant font-bold text-romantic-700">
              Menü
            </h2>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-romantic-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg sm:text-xl">{link.icon}</span>
                <span className="font-medium text-sm sm:text-base">{link.label}</span>
              </Link>
            ))}
          </nav>

          <button
            onClick={() => {
              closeSidebar();
              handleLogout();
            }}
            className="mt-8 w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="text-lg sm:text-xl">🚪</span>
            <span className="font-medium text-sm sm:text-base">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pt-0 lg:ml-64 p-4 sm:p-6 lg:p-8 min-h-screen">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/photos" element={<PhotoManagement />} />
          <Route path="/qrcode" element={<QRCodeManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin-settings" element={<AdminSettings />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
