import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { removeToken } from '../../utils/auth';
import { toast } from 'react-toastify';
import Dashboard from './Dashboard';
import PhotoManagement from './PhotoManagement';
import QRCodeManagement from './QRCodeManagement';
import Settings from './Settings';

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
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-elegant font-bold text-romantic-700 mb-8">
            Admin Panel
          </h1>

          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-romantic-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/photos" element={<PhotoManagement />} />
          <Route path="/qrcode" element={<QRCodeManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
