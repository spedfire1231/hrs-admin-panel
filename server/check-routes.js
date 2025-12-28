const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const analyticsRoutes = require('./routes/analytics');
const authMiddleware = require('./middleware/auth');

console.log('✅ Auth routes:', typeof authRoutes);
console.log('✅ User routes:', typeof userRoutes);
console.log('✅ Content routes:', typeof contentRoutes);
console.log('✅ Analytics routes:', typeof analyticsRoutes);
console.log('✅ Auth middleware:', typeof authMiddleware);