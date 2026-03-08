const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb, queryAll, queryOne, runSql } = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/jobs
router.get('/', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { search, category, job_type, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT j.*, u.name as poster_name, u.avatar as poster_avatar, u.role as poster_role
      FROM jobs j JOIN users u ON j.user_id = u.id
    `;
    const conditions = ['j.is_open = 1'];
    const params = [];

    if (search) {
      conditions.push('(j.title LIKE ? OR j.description LIKE ? OR j.location LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (category) { conditions.push('j.category = ?'); params.push(category); }
    if (job_type) { conditions.push('j.job_type = ?'); params.push(job_type); }

    query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY j.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const jobs = queryAll(db, query, params);
    res.json({ jobs });
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/jobs/mine
router.get('/mine', auth, async (req, res) => {
  try {
    const db = await getDb();
    const jobs = queryAll(db, 'SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ jobs });
  } catch (err) {
    console.error('Get my jobs error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/jobs/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const job = queryOne(db, `
      SELECT j.*, u.name as poster_name, u.avatar as poster_avatar, u.role as poster_role, u.email as poster_email
      FROM jobs j JOIN users u ON j.user_id = u.id WHERE j.id = ?
    `, [req.params.id]);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    res.json({ job });
  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/jobs
router.post('/', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { title, description, category, location, job_type, compensation, requirements, contact_email } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description are required.' });

    const id = uuidv4();
    runSql(db, `INSERT INTO jobs (id, user_id, title, description, category, location, job_type, compensation, requirements, contact_email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, title, description, category || 'acting', location || '', job_type || 'full-time', compensation || '', requirements || '', contact_email || '']);
    saveDb();

    const job = queryOne(db, 'SELECT * FROM jobs WHERE id = ?', [id]);
    res.status(201).json({ job });
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/jobs/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const job = queryOne(db, 'SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (job.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });

    const { title, description, category, location, job_type, compensation, requirements, contact_email, is_open } = req.body;
    const fields = [];
    const vals = [];

    if (title !== undefined) { fields.push('title = ?'); vals.push(title); }
    if (description !== undefined) { fields.push('description = ?'); vals.push(description); }
    if (category !== undefined) { fields.push('category = ?'); vals.push(category); }
    if (location !== undefined) { fields.push('location = ?'); vals.push(location); }
    if (job_type !== undefined) { fields.push('job_type = ?'); vals.push(job_type); }
    if (compensation !== undefined) { fields.push('compensation = ?'); vals.push(compensation); }
    if (requirements !== undefined) { fields.push('requirements = ?'); vals.push(requirements); }
    if (contact_email !== undefined) { fields.push('contact_email = ?'); vals.push(contact_email); }
    if (is_open !== undefined) { fields.push('is_open = ?'); vals.push(is_open); }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      vals.push(req.params.id);
      runSql(db, `UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`, vals);
      saveDb();
    }

    const updated = queryOne(db, 'SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ job: updated });
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const job = queryOne(db, 'SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (job.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });

    runSql(db, 'DELETE FROM jobs WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ message: 'Job deleted.' });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
