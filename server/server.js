/*  HRS-Admin  back-end  */
require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const mongoose      = require('mongoose');
const http          = require('http');
const socketIo      = require('socket.io');
const path          = require('path');

const app    = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* ---------- middleware ---------- */

const allowedOrigins = [
  "http://localhost:3000",
  "https://spedfire1231.github.io"
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/scripts", require("./routes/scripts"));
app.use("/api/faq", require("./routes/faq"));
app.use("/api/questions", require("./routes/questions"));

/* ---------- Mongo ---------- */
const DB_NAME = 'hrs_app';          // ← ваша БД
const MONGO_URI = process.env.MONGO_URL || 'mongodb+srv://hrs_admin:Sglorov1231@hrs2.zg5qaws.mongodb.net/' + DB_NAME + '?retryWrites=true&w=majority';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅  MongoDB connected   (' + DB_NAME + ')');
  } catch (err) {
    console.error('❌  MongoDB fail', err.message);
    process.exit(1);
  }
}

/* ---------- models ---------- */
const User  = require('./models/User');

/* ---------- routes ---------- */
const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/users');
const contentRoutes   = require('./routes/content');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/content',   contentRoutes);
app.use('/api/analytics', analyticsRoutes);

/* ---------- socket : online users ---------- */
const onlineUsers = new Map();          // userId → {socketId, lastSeen}

io.on('connection', socket => {
  const email = socket.handshake.auth?.email;
  console.log('WS connect', socket.id, email);

  if (email) {
    onlineUsers.set(email, {
      socketId: socket.id,
      lastSeen: new Date()
    });

    io.emit(
      'online-users-update',
      Array.from(onlineUsers.keys()).map(email => ({ email }))
    );
  }

  socket.on('disconnect', () => {
    if (email) {
      onlineUsers.delete(email);

      io.emit(
        'online-users-update',
        Array.from(onlineUsers.keys()).map(email => ({ email }))
      );
    }
    console.log('WS disconnect', socket.id);
  });
});

/* ---------- online list REST ---------- */
app.get('/api/online-users', async (_req, res) => {
  try {
    const ids = Array.from(onlineUsers.keys());
    const users = await User.find({ _id: { $in: ids } })
                            .select('email role firstName lastName')
                            .lean();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------- auto-create first admin ---------- */
async function ensureAdminUser() {
  const exists = await User.findOne({ role: 'owner' });
  if (exists) return;

  const admin = new User({
    email: 'admin@hrs.com',
    password: 'HRS_ADMIN_123',   // смените после первого входа
    role: 'owner',
    firstName: 'Super',
    lastName: 'Admin',
    isBanned: false
  });
  await admin.save();
  console.log('✅  Первый администратор создан  (admin@hrs.com / HRS_ADMIN_123)');
}

/* ---------- error handler ---------- */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error', message: err.message });
});

/* ---------- start ---------- */
const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  await ensureAdminUser();          // ← создаём админа при первом запуске
  server.listen(PORT, () =>
    console.log(`🚀  Server ready  http://localhost:${PORT}`)
  );
})();