const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const authMiddleware = require('../middleware/auth');

// Get all memories (Public)
router.get('/', async (req, res) => {
  try {
    const { sort = 'newest' } = req.query;
    const sortOption = sort === 'oldest' ? { created_at: 1 } : { created_at: -1 };

    const memories = await Memory.find().sort(sortOption);
    res.json(memories);
  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({ message: 'Anılar yüklenirken hata oluştu' });
  }
});

// Create memory (Public)
router.post('/', async (req, res) => {
  try {
    const { guest_name, message } = req.body;

    if (!guest_name || !message) {
      return res.status(400).json({ message: 'İsim ve anı gereklidir' });
    }

    if (guest_name.trim().length < 2) {
      return res.status(400).json({ message: 'İsim en az 2 karakter olmalıdır' });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ message: 'Anı en az 10 karakter olmalıdır' });
    }

    const memory = new Memory({
      guest_name: guest_name.trim(),
      message: message.trim()
    });

    await memory.save();
    res.status(201).json({ message: 'Anınız paylaşıldı!', memory });
  } catch (error) {
    console.error('Create memory error:', error);
    res.status(500).json({ message: 'Anı kaydedilirken hata oluştu' });
  }
});

// Delete memory (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: 'Anı bulunamadı' });
    }

    await Memory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Anı silindi' });
  } catch (error) {
    console.error('Delete memory error:', error);
    res.status(500).json({ message: 'Anı silinirken hata oluştu' });
  }
});

// Bulk delete memories (Admin only)
router.post('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { memoryIds } = req.body;

    if (!memoryIds || !Array.isArray(memoryIds) || memoryIds.length === 0) {
      return res.status(400).json({ message: 'Geçersiz anı ID listesi' });
    }

    await Memory.deleteMany({ _id: { $in: memoryIds } });

    res.json({
      message: `${memoryIds.length} anı silindi`,
      deletedCount: memoryIds.length
    });
  } catch (error) {
    console.error('Bulk delete memories error:', error);
    res.status(500).json({ message: 'Anılar silinirken hata oluştu' });
  }
});

// Get stats (Admin only)
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const totalMemories = await Memory.countDocuments();

    // Get recent memories (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentMemories = await Memory.countDocuments({
      created_at: { $gte: sevenDaysAgo }
    });

    res.json({
      total: totalMemories,
      recent: recentMemories
    });
  } catch (error) {
    console.error('Get memory stats error:', error);
    res.status(500).json({ message: 'İstatistikler alınırken hata oluştu' });
  }
});

module.exports = router;
