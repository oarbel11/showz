const express = require('express');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb, queryAll, queryOne, runSql } = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// CV upload config
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cv-${req.user.id}-${Date.now()}${ext}`);
  }
});
const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF and DOC files are allowed.'));
  }
});

// Email transporter (uses Ethereal for POC — catches emails in a test inbox)
let transporter = null;
async function getTransporter() {
  if (transporter) return transporter;
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log(`📧 Email test account: ${testAccount.user}`);
  return transporter;
}

// POST /api/applications/:jobId/apply — Apply to a job with CV
router.post('/:jobId/apply', auth, uploadCV.single('cv'), async (req, res) => {
  try {
    const db = await getDb();
    const job = queryOne(db, 'SELECT j.*, u.email as agent_email, u.name as agent_name FROM jobs j JOIN users u ON j.user_id = u.id WHERE j.id = ?', [req.params.jobId]);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (!job.is_open) return res.status(400).json({ error: 'This job is no longer open.' });

    // Check if already applied
    const existing = queryOne(db, 'SELECT id FROM applications WHERE job_id = ? AND user_id = ?', [req.params.jobId, req.user.id]);
    if (existing) return res.status(400).json({ error: 'You have already applied to this job.' });

    const cvFile = req.file ? `/uploads/${req.file.filename}` : '';
    const message = req.body.message || '';
    const appId = uuidv4();

    runSql(db, 'INSERT INTO applications (id, job_id, user_id, cv_file, message) VALUES (?, ?, ?, ?, ?)',
      [appId, req.params.jobId, req.user.id, cvFile, message]);

    // Create notification for the agent
    const notifId = uuidv4();
    const applicant = queryOne(db, 'SELECT name, role FROM users WHERE id = ?', [req.user.id]);
    const notifTitle = `מועמדות חדשה: ${job.title}`;
    const notifBody = `${applicant.name} הגיש/ה מועמדות למשרה "${job.title}"`;
    const notifData = JSON.stringify({ jobId: job.id, applicationId: appId, applicantId: req.user.id });

    runSql(db, 'INSERT INTO notifications (id, user_id, type, title, body, data) VALUES (?, ?, ?, ?, ?, ?)',
      [notifId, job.user_id, 'application', notifTitle, notifBody, notifData]);

    saveDb();

    // Send email to agent (async, don't block response)
    sendApplicationEmail(job, applicant, req.user, cvFile, message).catch(err => console.error('Email error:', err));

    res.status(201).json({ message: 'Application submitted successfully.', applicationId: appId });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/applications/:jobId — Get all applicants for a job (agent only)
router.get('/:jobId', auth, async (req, res) => {
  try {
    const db = await getDb();
    const job = queryOne(db, 'SELECT * FROM jobs WHERE id = ?', [req.params.jobId]);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (job.user_id !== req.user.id) return res.status(403).json({ error: 'Only the job poster can view applications.' });

    const applications = queryAll(db, `
      SELECT a.id, a.cv_file, a.message, a.created_at,
        u.id as user_id, u.name, u.email, u.role, u.avatar, u.phone, u.location, u.skills
      FROM applications a
      JOIN users u ON a.user_id = u.id
      WHERE a.job_id = ?
      ORDER BY a.created_at DESC
    `, [req.params.jobId]);

    res.json({ applications, job });
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/applications/notifications/all — Get notifications for current user
router.get('/notifications/all', auth, async (req, res) => {
  try {
    const db = await getDb();
    const notifications = queryAll(db,
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    const unreadCount = queryOne(db,
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ notifications, unreadCount: unreadCount?.count || 0 });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/applications/notifications/read — Mark all notifications as read
router.put('/notifications/read', auth, async (req, res) => {
  try {
    const db = await getDb();
    runSql(db, 'UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    saveDb();
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Helper: send email to agent about new application
async function sendApplicationEmail(job, applicant, applicantUser, cvFile, message) {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: '"ShowZ Platform" <noreply@showz.app>',
      to: job.agent_email,
      subject: `מועמדות חדשה למשרה: ${job.title}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">ShowZ<span style="color: #f59e0b">.</span></h1>
            <p style="color: #c7d2fe; margin: 5px 0 0;">מועמדות חדשה להצעת עבודה</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1f2937;">שלום ${job.agent_name},</h2>
            <p style="color: #4b5563;">התקבלה מועמדות חדשה למשרה <strong>"${job.title}"</strong></p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <h3 style="color: #4f46e5; margin-top: 0;">פרטי המועמד/ת</h3>
              <p><strong>שם:</strong> ${applicant.name}</p>
              <p><strong>אימייל:</strong> ${applicantUser.email}</p>
              <p><strong>תפקיד:</strong> ${applicant.role}</p>
              ${message ? `<p><strong>הודעה:</strong> ${message}</p>` : ''}
              ${cvFile ? '<p><strong>קובץ קורות חיים:</strong> מצורף (זמין להורדה מהמערכת)</p>' : '<p><em>לא צורף קובץ קורות חיים</em></p>'}
            </div>
            <p style="color: #6b7280; font-size: 12px;">הודעה זו נשלחה אוטומטית ממערכת ShowZ</p>
          </div>
        </div>
      `,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`📧 Email preview: ${previewUrl}`);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

module.exports = router;
