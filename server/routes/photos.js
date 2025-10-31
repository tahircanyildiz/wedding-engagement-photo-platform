const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const Settings = require('../models/Settings');
const cloudinary = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth');

// Get all photos (Public)
router.get('/', async (req, res) => {
  try {
    const { sort = 'newest', uploader } = req.query;

    let query = {};
    if (uploader) {
      query.uploader_name = new RegExp(uploader, 'i');
    }

    let sortOption = { upload_date: -1 }; // Default: newest
    if (sort === 'oldest') {
      sortOption = { upload_date: 1 };
    }

    const photos = await Photo.find(query).sort(sortOption);
    res.json(photos);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ message: 'Fotoğraflar yüklenirken hata oluştu' });
  }
});

// Upload photos (Public)
router.post('/upload', async (req, res) => {
  try {
    const { photos, uploader_name } = req.body;

    if (!uploader_name || !uploader_name.trim()) {
      return res.status(400).json({ message: 'İsim zorunludur' });
    }

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ message: 'En az bir fotoğraf gerekli' });
    }

    // Check if upload is enabled
    const settings = await Settings.getSettings();
    if (!settings.upload_enabled) {
      return res.status(403).json({ message: 'Fotoğraf yükleme şu an kapalı' });
    }

    // Save photos to database
    const savedPhotos = await Photo.insertMany(
      photos.map(photo => ({
        cloudinary_url: photo.url,
        cloudinary_public_id: photo.public_id,
        uploader_name: uploader_name.trim()
      }))
    );

    res.status(201).json({
      message: `Teşekkürler ${uploader_name.trim()}! ${photos.length} fotoğraf başarıyla yüklendi`,
      photos: savedPhotos
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Fotoğraf yüklenirken hata oluştu' });
  }
});

// Delete photo (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }

    // Try to delete from Cloudinary, but don't fail if it errors
    try {
      await cloudinary.uploader.destroy(photo.cloudinary_public_id);
      console.log(`Cloudinary'den silindi: ${photo.cloudinary_public_id}`);
    } catch (cloudinaryError) {
      // Log but continue - we'll still delete from DB
      console.error(`Cloudinary silme hatası (${photo.cloudinary_public_id}):`, cloudinaryError.message);
    }

    // Delete from database (this should always work)
    await Photo.findByIdAndDelete(req.params.id);

    res.json({ message: 'Fotoğraf başarıyla silindi' });
  } catch (error) {
    console.error('Delete photo error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Fotoğraf silinirken hata oluştu',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
});

// Bulk delete photos (Admin only)
router.post('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { photoIds } = req.body;

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({ message: 'Fotoğraf ID\'leri gerekli' });
    }

    const photos = await Photo.find({ _id: { $in: photoIds } });

    if (photos.length === 0) {
      return res.status(404).json({ message: 'Fotoğraf bulunamadı' });
    }

    // Delete from Cloudinary (ignore errors for missing images)
    const deletePromises = photos.map(photo =>
      cloudinary.uploader.destroy(photo.cloudinary_public_id)
        .catch(err => {
          console.log(`Cloudinary silme hatası (devam ediliyor): ${err.message}`);
          return { result: 'not found' }; // Continue anyway
        })
    );
    await Promise.all(deletePromises);

    // Delete from database
    const result = await Photo.deleteMany({ _id: { $in: photoIds } });

    res.json({
      message: `${result.deletedCount} fotoğraf başarıyla silindi`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      message: 'Fotoğraflar silinirken hata oluştu',
      error: error.message
    });
  }
});

// Get photo statistics (Admin only)
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const totalPhotos = await Photo.countDocuments();

    // Get unique uploaders count
    const uploaders = await Photo.distinct('uploader_name');
    const totalUploaders = uploaders.length;

    // Get top 5 uploaders
    const topUploaders = await Photo.aggregate([
      {
        $group: {
          _id: '$uploader_name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get recent photos
    const recentPhotos = await Photo.find()
      .sort({ upload_date: -1 })
      .limit(10);

    // Get uploads per uploader
    const uploaderStats = await Photo.aggregate([
      {
        $group: {
          _id: '$uploader_name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalPhotos,
      totalUploaders,
      topUploaders,
      recentPhotos,
      uploaderStats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'İstatistikler yüklenirken hata oluştu' });
  }
});

module.exports = router;
