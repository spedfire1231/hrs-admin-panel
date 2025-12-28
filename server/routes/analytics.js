const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Script = require('../models/Script');
const authMiddleware = require('../middleware/auth');

// Получить общую статистику
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const [
      totalUsers,
      onlineUsers,
      totalScripts,
      totalFaqs,
      totalQuestions,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isOnline: true }),
      Script.countDocuments({ category: 'script' }),
      Script.countDocuments({ category: 'faq' }),
      Script.countDocuments({ category: 'question' }),
      User.find({}, 'firstName lastName email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    res.json({
      totalUsers,
      onlineUsers,
      totalScripts,
      totalFaqs,
      totalQuestions,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить статистику по пользователям
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const onlineStats = await User.aggregate([
      {
        $group: {
          _id: '$isOnline',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      byRole: userStats,
      byStatus: onlineStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить статистику по контенту
router.get('/content', authMiddleware, async (req, res) => {
  try {
    const contentStats = await Script.aggregate([
      {
        $group: {
          _id: {
            category: '$category',
            language: '$language'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const usageStats = await Script.aggregate([
      {
        $group: {
          _id: '$category',
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);

    res.json({
      byCategoryAndLanguage: contentStats,
      usageByCategory: usageStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;