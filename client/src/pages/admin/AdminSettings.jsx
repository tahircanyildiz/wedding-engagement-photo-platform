import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const AdminSettings = () => {
  const [usernameData, setUsernameData] = useState({
    newUsername: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [currentUsername, setCurrentUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  useEffect(() => {
    fetchCurrentUsername();
  }, []);

  const fetchCurrentUsername = async () => {
    try {
      const response = await api.get('/auth/verify');
      setCurrentUsername(response.data.admin.username);
      setUsernameData({ newUsername: response.data.admin.username });
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  // Kullanıcı adı validasyonu
  const validateUsername = (value) => {
    const newErrors = { ...errors };

    if (!value) {
      newErrors.newUsername = 'Kullanıcı adı gereklidir';
    } else if (value.length < 3) {
      newErrors.newUsername = 'Kullanıcı adı en az 3 karakter olmalıdır';
    } else if (value === currentUsername) {
      newErrors.newUsername = 'Yeni kullanıcı adı mevcut ile aynı';
    } else {
      delete newErrors.newUsername;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Şifre validasyonu
  const validatePasswordField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'currentPassword':
        if (!value) {
          newErrors.currentPassword = 'Mevcut şifre gereklidir';
        } else {
          delete newErrors.currentPassword;
        }
        break;

      case 'newPassword':
        if (!value) {
          newErrors.newPassword = 'Yeni şifre gereklidir';
        } else if (value.length < 6) {
          newErrors.newPassword = 'Yeni şifre en az 6 karakter olmalıdır';
        } else if (passwordData.currentPassword && value === passwordData.currentPassword) {
          newErrors.newPassword = 'Yeni şifre mevcut şifreden farklı olmalıdır';
        } else {
          delete newErrors.newPassword;
        }

        if (passwordData.confirmPassword && value !== passwordData.confirmPassword) {
          newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        } else if (passwordData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Şifre onayı gereklidir';
        } else if (value !== passwordData.newPassword) {
          newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUsernameChange = (e) => {
    const { value } = e.target;
    setUsernameData({ newUsername: value });

    if (touched.newUsername) {
      validateUsername(value);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });

    if (touched[name]) {
      validatePasswordField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });

    if (name === 'newUsername') {
      validateUsername(usernameData.newUsername);
    } else {
      validatePasswordField(name, e.target.value);
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();

    setTouched({ ...touched, newUsername: true });

    if (!validateUsername(usernameData.newUsername)) {
      toast.error('Lütfen kullanıcı adını kontrol edin');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/change-username', {
        newUsername: usernameData.newUsername
      });

      toast.success('Kullanıcı adı başarıyla değiştirildi!');
      setCurrentUsername(usernameData.newUsername);
      setTouched({ ...touched, newUsername: false });
    } catch (error) {
      console.error('Username change error:', error);
      const errorMessage = error.response?.data?.message;

      if (errorMessage?.includes('kullanılıyor')) {
        setErrors({ ...errors, newUsername: 'Bu kullanıcı adı zaten kullanılıyor' });
        toast.error('Bu kullanıcı adı zaten kullanılıyor!');
      } else {
        toast.error(errorMessage || 'Kullanıcı adı değiştirilemedi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      ...touched,
      currentPassword: true,
      newPassword: true,
      confirmPassword: true
    });

    const isCurrentPasswordValid = validatePasswordField('currentPassword', passwordData.currentPassword);
    const isNewPasswordValid = validatePasswordField('newPassword', passwordData.newPassword);
    const isConfirmPasswordValid = validatePasswordField('confirmPassword', passwordData.confirmPassword);

    if (!isCurrentPasswordValid || !isNewPasswordValid || !isConfirmPasswordValid) {
      toast.error('Lütfen tüm hataları düzeltin');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Şifre başarıyla değiştirildi! Lütfen yeni şifrenizle giriş yapın.');

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTouched({
        ...touched,
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
      });
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.message;

      if (errorMessage === 'Mevcut şifre yanlış') {
        setErrors({ ...errors, currentPassword: 'Mevcut şifre hatalı' });
        toast.error('Mevcut şifre hatalı! Lütfen kontrol edin.');
      } else if (errorMessage?.includes('en az 6 karakter')) {
        setErrors({ ...errors, newPassword: errorMessage });
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage || 'Şifre değiştirilemedi. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClasses = "w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:outline-none transition-colors";

    if (touched[fieldName] && errors[fieldName]) {
      return `${baseClasses} border-red-500 focus:ring-red-500 focus:border-red-500`;
    } else if (touched[fieldName] && !errors[fieldName] && (fieldName === 'newUsername' ? usernameData.newUsername : passwordData[fieldName])) {
      return `${baseClasses} border-green-500 focus:ring-green-500 focus:border-green-500`;
    } else {
      return `${baseClasses} border-gray-300 focus:ring-romantic-500 focus:border-transparent`;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Kullanıcı Adı Değiştirme */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl sm:text-3xl font-elegant font-bold text-romantic-700 mb-6">
          Kullanıcı Adı Değiştir
        </h2>

        <form onSubmit={handleUsernameSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentUsernameDisplay" className="block text-sm font-medium text-gray-700 mb-2">
              Mevcut Kullanıcı Adı
            </label>
            <input
              type="text"
              id="currentUsernameDisplay"
              value={currentUsername}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Kullanıcı Adı <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="newUsername"
                name="newUsername"
                value={usernameData.newUsername}
                onChange={handleUsernameChange}
                onBlur={handleBlur}
                className={getInputClassName('newUsername')}
                placeholder="Yeni kullanıcı adınızı girin (en az 3 karakter)"
                disabled={loading}
              />
              {touched.newUsername && !errors.newUsername && usernameData.newUsername && usernameData.newUsername !== currentUsername && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                  ✓
                </span>
              )}
            </div>
            {touched.newUsername && errors.newUsername && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.newUsername}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || errors.newUsername || usernameData.newUsername === currentUsername}
            className="w-full bg-romantic-600 text-white px-6 py-3 rounded-lg hover:bg-romantic-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Kaydediliyor...' : 'Kullanıcı Adını Değiştir'}
          </button>
        </form>
      </div>

      {/* Şifre Değiştirme */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl sm:text-3xl font-elegant font-bold text-romantic-700 mb-6">
          Şifre Değiştir
        </h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          {/* Mevcut Şifre */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Mevcut Şifre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.currentPassword ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                onBlur={handleBlur}
                className={getInputClassName('currentPassword')}
                placeholder="Mevcut şifrenizi girin"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('currentPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPasswords.currentPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {touched.currentPassword && errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* Yeni Şifre */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.newPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                onBlur={handleBlur}
                className={getInputClassName('newPassword')}
                placeholder="Yeni şifrenizi girin (en az 6 karakter)"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('newPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPasswords.newPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {touched.newPassword && errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.newPassword}
              </p>
            )}
            {passwordData.newPassword && !errors.newPassword && touched.newPassword && (
              <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                <span className="text-green-500">✓</span>
                Şifre geçerli
              </p>
            )}
          </div>

          {/* Yeni Şifre Onay */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre (Tekrar) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                onBlur={handleBlur}
                className={getInputClassName('confirmPassword')}
                placeholder="Yeni şifrenizi tekrar girin"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPasswords.confirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.confirmPassword}
              </p>
            )}
            {touched.confirmPassword && !errors.confirmPassword && passwordData.confirmPassword && (
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Şifreler eşleşiyor
              </p>
            )}
          </div>

          {/* Uyarı Mesajı */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Şifrenizi değiştirdikten sonra tekrar giriş yapmanız gerekecektir.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading || errors.currentPassword || errors.newPassword || errors.confirmPassword}
              className="flex-1 bg-romantic-600 text-white px-6 py-3 rounded-lg hover:bg-romantic-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTouched({ ...touched, currentPassword: false, newPassword: false, confirmPassword: false });
              }}
              disabled={loading}
              className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
            >
              Temizle
            </button>
          </div>
        </form>

        {/* Güvenlik Bilgileri */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Güvenlik İpuçları</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-romantic-600 mr-2">•</span>
              <span>Şifreniz en az 6 karakter uzunluğunda olmalıdır</span>
            </li>
            <li className="flex items-start">
              <span className="text-romantic-600 mr-2">•</span>
              <span>Güçlü bir şifre için harf, rakam ve özel karakter kullanın</span>
            </li>
            <li className="flex items-start">
              <span className="text-romantic-600 mr-2">•</span>
              <span>Şifrenizi başka hiç kimseyle paylaşmayın</span>
            </li>
            <li className="flex items-start">
              <span className="text-romantic-600 mr-2">•</span>
              <span>Düzenli olarak şifrenizi değiştirin</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
