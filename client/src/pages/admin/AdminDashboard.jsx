import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { removeToken } from '../../utils/auth';
import { toast } from 'react-toastify';
import Dashboard from './Dashboard';
import PhotoManagement from './PhotoManagement';
import QRCodeManagement from './QRCodeManagement';
import Settings from './Settings';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    removeToken();
    toast.success('Çıkış yapıldı');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
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
      {/* Sidebar - Responsive */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg overflow-y-auto z-50">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-elegant font-bold text-romantic-700">
              Admin Panel
            </h1>
            {/* Siteye Git Butonu */}
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

          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
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
            onClick={handleLogout}
            className="mt-8 w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="text-lg sm:text-xl">🚪</span>
            <span className="font-medium text-sm sm:text-base">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Responsive */}
      <main className="ml-64 p-4 sm:p-6 lg:p-8">
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
