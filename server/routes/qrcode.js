const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const authMiddleware = require('../middleware/auth');
const Settings = require('../models/Settings');

// Generate QR Code (Admin only)
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL gerekli' });
    }

    // Get event info for QR code
    const settings = await Settings.getSettings();

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      width: 400,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      qrCode: qrCodeDataURL,
      url,
      eventInfo: settings.event_info
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ message: 'QR kod oluşturulurken hata oluştu' });
  }
});

module.exports = router;
