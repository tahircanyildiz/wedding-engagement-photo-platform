const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/auth');

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Kullanıcı adı ve şifre gerekli' });
    }

    // Find admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // Generate Access Token (30 minutes)
    const accessToken = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    // Generate Refresh Token (7 days)
    const refreshToken = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token to database
    admin.refreshToken = refreshToken;
    await admin.save();

    res.json({
      accessToken,
      refreshToken,
      admin: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token gerekli' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Find admin and check if refresh token matches
    const admin = await Admin.findById(decoded.id);
    if (!admin || admin.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Geçersiz refresh token' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Geçersiz veya süresi dolmuş refresh token' });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (admin) {
      admin.refreshToken = null;
      await admin.save();
    }
    res.json({ message: 'Çıkış yapıldı' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Çıkış yapılırken hata oluştu' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({ message: 'Admin bulunamadı' });
    }

    res.json({ admin });
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz token' });
  }
});

// Change Username (Admin only)
router.post('/change-username', authMiddleware, async (req, res) => {
  try {
    const { newUsername } = req.body;

    // Validasyon
    if (!newUsername) {
      return res.status(400).json({ message: 'Yeni kullanıcı adı gerekli' });
    }

    if (newUsername.length < 3) {
      return res.status(400).json({ message: 'Kullanıcı adı en az 3 karakter olmalıdır' });
    }

    // Kullanıcı adının zaten kullanılıp kullanılmadığını kontrol et
    const existingAdmin = await Admin.findOne({ username: newUsername });
    if (existingAdmin && existingAdmin._id.toString() !== req.admin.id) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    // Admin'i bul ve güncelle
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin bulunamadı' });
    }

    admin.username = newUsername;
    await admin.save();

    res.json({
      message: 'Kullanıcı adı başarıyla değiştirildi',
      username: newUsername
    });
  } catch (error) {
    console.error('Change username error:', error);
    res.status(500).json({ message: 'Kullanıcı adı değiştirilirken hata oluştu' });
  }
});

// Change Password (Admin only)
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validasyon
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mevcut şifre ve yeni şifre gerekli' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Yeni şifre en az 6 karakter olmalıdır' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Yeni şifre mevcut şifreden farklı olmalıdır' });
    }

    // Admin'i bul (token'dan gelen ID ile)
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin bulunamadı' });
    }

    // Mevcut şifreyi kontrol et
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mevcut şifre yanlış' });
    }

    // Yeni şifreyi kaydet
    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Şifre değiştirilirken hata oluştu' });
  }
});

module.exports = router;
