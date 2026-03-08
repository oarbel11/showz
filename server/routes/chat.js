const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb, queryAll, queryOne, runSql } = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/chat/conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const db = await getDb();
    const conversations = queryAll(db, `
      SELECT c.id, c.created_at,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = ?
      ORDER BY last_message_at DESC
    `, [req.user.id]);

    const enriched = conversations.map(conv => {
      const otherUser = queryOne(db, `
        SELECT u.id, u.name, u.avatar, u.role
        FROM conversation_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.conversation_id = ? AND cp.user_id != ?
      `, [conv.id, req.user.id]);
      return { ...conv, otherUser };
    });

    res.json({ conversations: enriched });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/chat/conversations/:id/messages
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const db = await getDb();
    const participant = queryOne(db,
      'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!participant) return res.status(403).json({ error: 'Not part of this conversation.' });

    const messages = queryAll(db, `
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
      FROM messages m JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ? ORDER BY m.created_at ASC
    `, [req.params.id]);

    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/chat/conversations
router.post('/conversations', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });
    if (userId === req.user.id) return res.status(400).json({ error: 'Cannot chat with yourself.' });

    const existing = queryOne(db, `
      SELECT cp1.conversation_id
      FROM conversation_participants cp1
      JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
      WHERE cp1.user_id = ? AND cp2.user_id = ?
    `, [req.user.id, userId]);

    if (existing) {
      const conv = queryOne(db, 'SELECT * FROM conversations WHERE id = ?', [existing.conversation_id]);
      const otherUser = queryOne(db, 'SELECT id, name, avatar, role FROM users WHERE id = ?', [userId]);
      return res.json({ conversation: { ...conv, otherUser } });
    }

    const convId = uuidv4();
    runSql(db, 'INSERT INTO conversations (id) VALUES (?)', [convId]);
    runSql(db, 'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)', [convId, req.user.id]);
    runSql(db, 'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)', [convId, userId]);
    saveDb();

    const conv = queryOne(db, 'SELECT * FROM conversations WHERE id = ?', [convId]);
    const otherUser = queryOne(db, 'SELECT id, name, avatar, role FROM users WHERE id = ?', [userId]);

    res.status(201).json({ conversation: { ...conv, otherUser } });
  } catch (err) {
    console.error('Create conversation error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/chat/conversations/:id/messages
router.post('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const db = await getDb();
    const participant = queryOne(db,
      'SELECT * FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!participant) return res.status(403).json({ error: 'Not part of this conversation.' });

    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content is required.' });

    const msgId = uuidv4();
    runSql(db, 'INSERT INTO messages (id, conversation_id, sender_id, content) VALUES (?, ?, ?, ?)',
      [msgId, req.params.id, req.user.id, content]);
    saveDb();

    const message = queryOne(db, `
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
      FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?
    `, [msgId]);

    res.status(201).json({ message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
