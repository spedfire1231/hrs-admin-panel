const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Регистрация администратора (только для первого запуска)
router.post('/setup-admin', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Проверяем, существует ли уже админ
    const existingAdmin = await User.findOne({ role: 'owner' });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Администратор уже существует' });
    }

    const admin = new User({
      email,
      password,
      role: 'owner',
      firstName: firstName || 'Admin',
      lastName: lastName || 'User'
    });

    await admin.save();

    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Вход в систему
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isBanned: false });
    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Обновляем статус онлайн
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Выход из системы
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    
    await User.findByIdAndUpdate(userId, { 
      isOnline: false, 
      lastSeen: new Date() 
    });

    res.json({ message: 'Вы успешно вышли из системы' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Проверка токена
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Неверный токен' });
  }
});

module.exports = router;