import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { setToken } from '../../utils/auth';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(credentials);
      setToken(response.data.token);
      toast.success('Giriş başarılı!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        toast.error('Geçersiz kullanıcı adı veya şifre');
      } else {
        toast.error('Giriş yapılırken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-elegant font-bold text-romantic-700 mb-2">
            Admin Paneli
          </h1>
          <p className="text-gray-600">Giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="input-field"
              placeholder="admin"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="input-field"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-romantic-600 hover:text-romantic-700 font-medium"
          >
            ← Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
