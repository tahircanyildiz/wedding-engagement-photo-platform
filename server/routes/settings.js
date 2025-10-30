const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/auth');

// Get settings (Public - for homepage)
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Ayarlar yüklenirken hata oluştu' });
  }
});

// Update settings (Admin only)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { upload_enabled, event_info } = req.body;

    const settings = await Settings.getSettings();

    if (upload_enabled !== undefined) {
      settings.upload_enabled = upload_enabled;
    }

    if (event_info) {
      if (event_info.couple_names !== undefined) {
        settings.event_info.couple_names = event_info.couple_names;
      }
      if (event_info.date !== undefined) {
        settings.event_info.date = event_info.date;
      }
      if (event_info.location !== undefined) {
        settings.event_info.location = event_info.location;
      }
      if (event_info.description !== undefined) {
        settings.event_info.description = event_info.description;
      }
    }

    settings.updatedAt = Date.now();
    await settings.save();

    res.json({ message: 'Ayarlar güncellendi', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Ayarlar güncellenirken hata oluştu' });
  }
});

// Toggle upload status (Admin only)
router.patch('/toggle-upload', authMiddleware, async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.upload_enabled = !settings.upload_enabled;
    settings.updatedAt = Date.now();
    await settings.save();

    res.json({
      message: `Fotoğraf yükleme ${settings.upload_enabled ? 'açıldı' : 'kapatıldı'}`,
      upload_enabled: settings.upload_enabled
    });
  } catch (error) {
    console.error('Toggle upload error:', error);
    res.status(500).json({ message: 'Ayar değiştirilirken hata oluştu' });
  }
});

module.exports = router;
