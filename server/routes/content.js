const express = require('express');
const router = express.Router();
const Script = require('../models/Script');
const authMiddleware = require('../middleware/auth');

// Получить все скрипты
router.get('/scripts', authMiddleware, async (req, res) => {
  try {
    const { language, category } = req.query;
    const filter = {
      ownerEmail: req.user.email,
      category : 'script'
    };
    
    if (language) filter.language = language;
    if (category) filter.category = category;

    const scripts = await Script.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    res.json(scripts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новый скрипт
router.post('/scripts', authMiddleware, async (req, res) => {
  try {
    const { name, content, language, category, tags } = req.body;
    
    const script = new Script({
      name,
      content,
      language: language || 'en',
      category: category || 'script',
      tags: tags || [],
      createdBy: req.user.userId,
      ownerEmail: req.user.email
    });

    await script.save();
    
    const populatedScript = await Script.findById(script._id)
      .populate('createdBy', 'firstName lastName email');

    res.json({
      message: 'Скрипт создан успешно',
      script: populatedScript
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить скрипт
router.put('/scripts/:id', authMiddleware, async (req, res) => {
  try {
    const { name, content, language, category, tags, isActive } = req.body;
    
    const script = await Script.findByIdAndUpdate(
      req.params.id,
      {
        name,
        content,
        language,
        category,
        tags,
        isActive,
        createdBy: req.user.userId,
        ownerEmail: req.user.email,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!script) {
      return res.status(404).json({ error: 'Скрипт не найден' });
    }

    res.json({
      message: 'Скрипт обновлен успешно',
      script
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить скрипт
router.delete('/scripts/:id', authMiddleware, async (req, res) => {
  try {
    const script = await Script.findByIdAndDelete(req.params.id);
    
    if (!script) {
      return res.status(404).json({ error: 'Скрипт не найден' });
    }

    if (script.ownerEmail !== req.user.email) {
  return res.status(403).json({ error: 'Access denied' });
}

    res.json({ message: 'Скрипт удален успешно' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Увеличить счетчик использования скрипта
router.post('/scripts/:id/use', authMiddleware, async (req, res) => {
  try {
    const script = await Script.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { usageCount: 1 },
        lastUsed: new Date()
      },
      { new: true }
    );

    if (!script) {
      return res.status(404).json({ error: 'Скрипт не найден' });
    }

    if (script.ownerEmail !== req.user.email) {
  return res.status(403).json({ error: 'Access denied' });
}

    res.json({ message: 'Счетчик использования обновлен' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить FAQ
router.get('/faq', authMiddleware, async (req, res) => {
  try {
    const { language } = req.query;
    const filter = { category: 'faq', ownerEmail: req.user.email };
    
    if (language) filter.language = language;

    const faqs = await Script.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить вопросы
router.get('/questions', authMiddleware, async (req, res) => {
  try {
    const { language } = req.query;
    const filter = { category: 'question', ownerEmail: req.user.email };
    
    if (language) filter.language = language;

    const questions = await Script.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;