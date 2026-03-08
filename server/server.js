require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb, queryAll, queryOne, runSql } = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/applications', require('./routes/applications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket.IO real-time chat
io.on('connection', async (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.user.id})`);

  try {
    const db = await getDb();
    const conversations = queryAll(db,
      'SELECT conversation_id FROM conversation_participants WHERE user_id = ?',
      [socket.user.id]
    );
    conversations.forEach(c => socket.join(c.conversation_id));
  } catch (err) {
    console.error('Socket join error:', err);
  }

  socket.on('join_conversation', async (conversationId) => {
    try {
      const db = await getDb();
      const participant = queryOne(db,
        'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
        [conversationId, socket.user.id]
      );
      if (participant) socket.join(conversationId);
    } catch (err) {
      console.error('Join conversation error:', err);
    }
  });

  socket.on('send_message', async ({ conversationId, content }) => {
    try {
      const db = await getDb();
      const participant = queryOne(db,
        'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
        [conversationId, socket.user.id]
      );
      if (!participant) return;

      const msgId = uuidv4();
      runSql(db, 'INSERT INTO messages (id, conversation_id, sender_id, content) VALUES (?, ?, ?, ?)',
        [msgId, conversationId, socket.user.id, content]);
      saveDb();

      const message = queryOne(db, `
        SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
        FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?
      `, [msgId]);

      io.to(conversationId).emit('new_message', message);
    } catch (err) {
      console.error('Send message error:', err);
    }
  });

  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit('user_typing', {
      userId: socket.user.id,
      name: socket.user.name,
      isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.name}`);
  });
});

// Initialize DB before starting server
async function start() {
  await getDb();
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`\n🎬 ShowZ Server running on http://localhost:${PORT}`);
    console.log(`   API endpoints: http://localhost:${PORT}/api`);
    console.log(`   WebSocket: ws://localhost:${PORT}\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
