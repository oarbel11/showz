const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb, queryAll, queryOne, runSql } = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

const ALL_USER_FIELDS = 'id, email, name, role, bio, skills, location, avatar, showreel, website, phone, height, eye_color, hair_color, languages, company_name, equipment, genres, created_at';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  }
});

// GET /api/users
router.get('/', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { search, role, limit = 50, offset = 0 } = req.query;
    let query = `SELECT ${ALL_USER_FIELDS} FROM users`;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push("(name LIKE ? OR skills LIKE ? OR bio LIKE ? OR company_name LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (role) { conditions.push('role = ?'); params.push(role); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const users = queryAll(db, query, params);

    let countQuery = 'SELECT COUNT(*) as count FROM users';
    if (conditions.length > 0) countQuery += ' WHERE ' + conditions.join(' AND ');
    const countParams = params.slice(0, -2);
    const totalResult = queryOne(db, countQuery, countParams);

    res.json({ users, total: totalResult ? totalResult.count : 0 });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/users/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const user = queryOne(db, `SELECT ${ALL_USER_FIELDS} FROM users WHERE id = ?`, [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const jobCount = queryOne(db, 'SELECT COUNT(*) as count FROM jobs WHERE user_id = ?', [req.params.id]);
    user.jobCount = jobCount ? jobCount.count : 0;

    // Include credits for actors
    if (user.role === 'actor') {
      user.credits = queryAll(db, 'SELECT * FROM credits WHERE user_id = ? ORDER BY year DESC', [req.params.id]);
    }

    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/users/:id
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'You can only edit your own profile.' });
    }
    const db = await getDb();
    const updatable = ['name', 'bio', 'skills', 'location', 'showreel', 'website', 'phone', 'role',
      'height', 'eye_color', 'hair_color', 'languages', 'company_name', 'equipment', 'genres'];

    const fields = [];
    const vals = [];
    for (const key of updatable) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = ?`);
        vals.push(req.body[key]);
      }
    }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      vals.push(req.params.id);
      runSql(db, `UPDATE users SET ${fields.join(', ')} WHERE id = ?`, vals);
      saveDb();
    }

    const user = queryOne(db, `SELECT ${ALL_USER_FIELDS} FROM users WHERE id = ?`, [req.params.id]);
    if (user.role === 'actor') {
      user.credits = queryAll(db, 'SELECT * FROM credits WHERE user_id = ? ORDER BY year DESC', [req.params.id]);
    }
    res.json({ user });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/users/:id/avatar
router.post('/:id/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'You can only update your own avatar.' });
    }
    if (!req.file) return res.status(400).json({ error: 'No image file provided.' });

    const db = await getDb();
    const avatarUrl = `/uploads/${req.file.filename}`;
    runSql(db, "UPDATE users SET avatar = ?, updated_at = datetime('now') WHERE id = ?", [avatarUrl, req.params.id]);
    saveDb();

    res.json({ avatar: avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ---- Credits (actor filmography) ----

// GET /api/users/:id/credits
router.get('/:id/credits', auth, async (req, res) => {
  try {
    const db = await getDb();
    const credits = queryAll(db, 'SELECT * FROM credits WHERE user_id = ? ORDER BY year DESC', [req.params.id]);
    res.json({ credits });
  } catch (err) {
    console.error('Get credits error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/users/:id/credits
router.post('/:id/credits', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'You can only edit your own credits.' });
    }
    const db = await getDb();
    const { year, title, credit_role, credit_type } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });

    const id = uuidv4();
    runSql(db, 'INSERT INTO credits (id, user_id, year, title, credit_role, credit_type) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.params.id, year || null, title, credit_role || '', credit_type || '']);
    saveDb();

    const credit = queryOne(db, 'SELECT * FROM credits WHERE id = ?', [id]);
    res.status(201).json({ credit });
  } catch (err) {
    console.error('Add credit error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/users/:id/credits/:creditId
router.delete('/:id/credits/:creditId', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'You can only delete your own credits.' });
    }
    const db = await getDb();
    runSql(db, 'DELETE FROM credits WHERE id = ? AND user_id = ?', [req.params.creditId, req.params.id]);
    saveDb();
    res.json({ message: 'Credit deleted.' });
  } catch (err) {
    console.error('Delete credit error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
