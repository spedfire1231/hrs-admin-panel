const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await User.findById(decoded.userId);
    if (!user || user.isBanned) {
      return res.status(401).json({ error: 'Пользователь не найден или заблокирован' });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

module.exports = authMiddleware;