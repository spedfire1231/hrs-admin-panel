const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Получить всех пользователей (только для админов)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать нового пользователя
router.post('/', authMiddleware, checkRole(['owner']), async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;

    // Проверка существующего пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const user = new User({
      email,
      password,
      role,
      firstName: firstName || '',
      lastName: lastName || ''
    });

    await user.save();

    res.json({
      message: 'Пользователь создан успешно',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* --------- обновление своего профиля --------- */
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName },
      { new: true }
    ).select('-password');
    res.json({ message: 'Профиль обновлён', user });
  } catch (e) {
    res.status(500).json({ error: e.message });
}});
/* --------- смена пароля --------- */
router.put('/me/password', authMiddleware, checkRole(['owner']), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ error: 'Текущий пароль неверен' });

    user.password = newPassword;   // pre-save хэширует автоматически
    await user.save();
    res.json({ message: 'Пароль изменён' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Удалить пользователя
router.delete('/:id', authMiddleware, checkRole(['owner']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // ❗ Захист від самовидалення (рекомендую)
      if (user._id.toString() === req.user.userId) {
        return res.status(400).json({ error: 'Ты не можешь сам себя удалить' });
      }

    res.json({ message: 'Пользователь удален успешно' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить пользователя по ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить устройства пользователя
router.get('/:id/devices', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('devices');
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user.devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить устройство пользователя
router.delete('/:userId/devices/:deviceId', authMiddleware, async (req, res) => {
  try {
    const { userId, deviceId } = req.params;
    
    await User.findByIdAndUpdate(
      userId,
      { $pull: { devices: { deviceId } } }
    );

    res.json({ message: 'Устройство удалено успешно' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;