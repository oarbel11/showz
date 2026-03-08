const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'showz.db');

async function seed() {
  const SQL = await initSqlJs();
  let db;

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Ensure tables exist
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL,
    role TEXT DEFAULT 'actor', bio TEXT DEFAULT '', skills TEXT DEFAULT '', location TEXT DEFAULT '',
    avatar TEXT DEFAULT '', showreel TEXT DEFAULT '', website TEXT DEFAULT '', phone TEXT DEFAULT '',
    height TEXT DEFAULT '', eye_color TEXT DEFAULT '', hair_color TEXT DEFAULT '',
    languages TEXT DEFAULT '', company_name TEXT DEFAULT '', equipment TEXT DEFAULT '',
    genres TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS credits (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, year INTEGER, title TEXT NOT NULL,
    credit_role TEXT DEFAULT '', credit_type TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL,
    category TEXT DEFAULT 'acting', location TEXT DEFAULT '', job_type TEXT DEFAULT 'full-time',
    compensation TEXT DEFAULT '', requirements TEXT DEFAULT '', contact_email TEXT DEFAULT '',
    is_open INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  const password = await bcrypt.hash('password123', 12);

  const users = [
    {
      id: uuidv4(), email: 'yael@showz.test', password, name: '\u05d9\u05e2\u05dc \u05db\u05d4\u05df', role: 'actor',
      bio: '\u05d1\u05d5\u05d2\u05e8\u05ea \u05d4\u05e1\u05d8\u05d5\u05d3\u05d9\u05d5 \u05dc\u05de\u05e9\u05d7\u05e7. \u05e0\u05d9\u05e1\u05d9\u05d5\u05df \u05d1\u05ea\u05d9\u05d0\u05d8\u05e8\u05d5\u05df, \u05d8\u05dc\u05d5\u05d5\u05d9\u05d6\u05d9\u05d4 \u05d5\u05e7\u05d5\u05dc\u05e0\u05d5\u05e2 \u05e2\u05e6\u05de\u05d0\u05d9. \u05d0\u05d5\u05d4\u05d1\u05ea \u05d0\u05ea\u05d2\u05e8\u05d9\u05dd \u05d5\u05ea\u05e4\u05e7\u05d9\u05d3\u05d9\u05dd \u05d3\u05e8\u05de\u05d8\u05d9\u05d9\u05dd.',
      skills: '\u05d3\u05e8\u05de\u05d4, \u05e7\u05d5\u05de\u05d3\u05d9\u05d4, \u05e9\u05d9\u05e8\u05d4, \u05e8\u05d9\u05e7\u05d5\u05d3 \u05de\u05d5\u05d3\u05e8\u05e0\u05d9, \u05d3\u05d9\u05d1\u05d5\u05d1',
      location: '\u05ea\u05dc \u05d0\u05d1\u05d9\u05d1 - \u05d9\u05e4\u05d5',
      height: '1.68 \u05e1"\u05de', eye_color: '\u05d7\u05d5\u05dd', hair_color: '\u05d7\u05d5\u05dd \u05db\u05d4\u05d4', languages: '\u05e2\u05d1\u05e8\u05d9\u05ea, \u05d0\u05e0\u05d2\u05dc\u05d9\u05ea',
    },
    {
      id: uuidv4(), email: 'daniel.levi@showz.test', password, name: '\u05d3\u05e0\u05d9\u05d0\u05dc \u05dc\u05d5\u05d9', role: 'director',
      bio: '\u05d1\u05de\u05d0\u05d9 \u05e7\u05d5\u05dc\u05e0\u05d5\u05e2 \u05d5\u05d8\u05dc\u05d5\u05d5\u05d9\u05d6\u05d9\u05d4 \u05e2\u05dd \u05e0\u05d9\u05e1\u05d9\u05d5\u05df \u05e9\u05dc \u05de\u05e2\u05dc 10 \u05e9\u05e0\u05d9\u05dd. \u05de\u05ea\u05de\u05d7\u05d4 \u05d1\u05e1\u05d9\u05e4\u05d5\u05e8\u05d9 \u05d3\u05e8\u05de\u05d4 \u05d5\u05de\u05ea\u05d7.',
      skills: '\u05d1\u05d9\u05de\u05d5\u05d9, \u05db\u05ea\u05d9\u05d1\u05ea \u05ea\u05e1\u05e8\u05d9\u05d8, \u05e2\u05e8\u05d9\u05db\u05d4',
      location: '\u05d9\u05e8\u05d5\u05e9\u05dc\u05d9\u05dd',
      genres: '\u05d3\u05e8\u05de\u05d4, \u05de\u05ea\u05d7, \u05d3\u05d5\u05e7\u05d5\u05de\u05e0\u05d8\u05e8\u05d9',
    },
    {
      id: uuidv4(), email: 'noa@showz.test', password, name: '\u05e0\u05d5\u05e2\u05d4 \u05d0\u05d1\u05e8\u05d4\u05dd', role: 'producer',
      bio: '\u05de\u05e4\u05d9\u05e7\u05d4 \u05d1\u05ea\u05e2\u05e9\u05d9\u05d9\u05ea \u05d4\u05d8\u05dc\u05d5\u05d5\u05d9\u05d6\u05d9\u05d4 \u05d5\u05d4\u05e7\u05d5\u05dc\u05e0\u05d5\u05e2. \u05d4\u05e4\u05e7\u05ea\u05d9 \u05e1\u05d3\u05e8\u05d5\u05ea \u05dc\u05db\u05d0\u05df, \u05d4\u05d5\u05d8 \u05d5\u05e8\u05e9\u05ea 13.',
      skills: '\u05d4\u05e4\u05e7\u05d4, \u05e0\u05d9\u05d4\u05d5\u05dc \u05e4\u05e8\u05d5\u05d9\u05e7\u05d8\u05d9\u05dd, \u05ea\u05e7\u05e6\u05d5\u05d1',
      location: '\u05ea\u05dc \u05d0\u05d1\u05d9\u05d1',
      company_name: '\u05e0\u05d5\u05e2\u05d4 \u05d4\u05e4\u05e7\u05d5\u05ea',
    },
    {
      id: uuidv4(), email: 'roi@showz.test', password, name: '\u05e8\u05d5\u05e2\u05d9 \u05de\u05d6\u05e8\u05d7\u05d9', role: 'cinematographer',
      bio: '\u05e6\u05dc\u05dd \u05e8\u05d0\u05e9\u05d9 (DOP) \u05e2\u05dd \u05e0\u05d9\u05e1\u05d9\u05d5\u05df \u05d1\u05e4\u05e8\u05e1\u05d5\u05de\u05d5\u05ea, \u05e1\u05e8\u05d8\u05d9\u05dd \u05e7\u05e6\u05e8\u05d9\u05dd \u05d5\u05e1\u05d3\u05e8\u05d5\u05ea \u05d3\u05e8\u05de\u05d4.',
      skills: '\u05e6\u05d9\u05dc\u05d5\u05dd \u05e7\u05d5\u05dc\u05e0\u05d5\u05e2\u05d9, \u05ea\u05d0\u05d5\u05e8\u05d4, \u05e6\u05d9\u05dc\u05d5\u05dd \u05d0\u05d5\u05d5\u05d9\u05e8',
      location: '\u05d7\u05d9\u05e4\u05d4',
      equipment: 'Sony FX9, RED Komodo, DJI RS3 Pro',
    },
    {
      id: uuidv4(), email: 'shira@showz.test', password, name: '\u05e9\u05d9\u05e8\u05d4 \u05d2\u05d5\u05dc\u05df', role: 'agent',
      bio: '\u05e1\u05d5\u05db\u05e0\u05ea \u05e9\u05d7\u05e7\u05e0\u05d9\u05dd \u05d5\u05db\u05d9\u05e9\u05e8\u05d5\u05e0\u05d5\u05ea. \u05de\u05d9\u05d9\u05e6\u05d2\u05ea \u05e9\u05d7\u05e7\u05e0\u05d9\u05dd \u05de\u05d5\u05d1\u05d9\u05dc\u05d9\u05dd \u05d1\u05ea\u05e2\u05e9\u05d9\u05d9\u05ea \u05d4\u05d1\u05d9\u05d3\u05d5\u05e8 \u05d4\u05d9\u05e9\u05e8\u05d0\u05dc\u05d9\u05ea.',
      skills: '\u05d9\u05d9\u05e6\u05d5\u05d2, \u05de\u05e9\u05d0 \u05d5\u05de\u05ea\u05df, \u05d9\u05d7\u05e1\u05d9 \u05e6\u05d9\u05d1\u05d5\u05e8',
      location: '\u05ea\u05dc \u05d0\u05d1\u05d9\u05d1',
      company_name: '\u05e1\u05d5\u05db\u05e0\u05d5\u05ea \u05d8\u05d0\u05dc\u05e0\u05d8\u05d9\u05dd VIP',
    },
  ];

  // Insert users (skip duplicates)
  for (const u of users) {
    const stmt = db.prepare('SELECT id FROM users WHERE email = ?');
    stmt.bind([u.email]);
    const exists = stmt.step();
    stmt.free();

    if (!exists) {
      db.run(`INSERT INTO users (id, email, password, name, role, bio, skills, location, height, eye_color, hair_color, languages, company_name, equipment, genres) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.id, u.email, u.password, u.name, u.role, u.bio, u.skills, u.location,
         u.height || '', u.eye_color || '', u.hair_color || '', u.languages || '',
         u.company_name || '', u.equipment || '', u.genres || '']);
      console.log(`  Created: ${u.name} (${u.role})`);

      // Add credits for actors
      if (u.role === 'actor') {
        const actorCredits = [
          { year: 2023, title: '\u05d4\u05e1\u05d5\u05d3\u05d5\u05ea \u05e9\u05dc \u05d0\u05ea\u05de\u05d5\u05dc', credit_role: '\u05de\u05d9\u05db\u05dc (\u05ea\u05e4\u05e7\u05d9\u05d3 \u05e8\u05d0\u05e9\u05d9)', credit_type: '\u05e1\u05e8\u05d8 \u05d2\u05de\u05e8 - \u05d0\u05d5\u05e0\u05d9\u05d1\u05e8\u05e1\u05d9\u05d8\u05ea \u05ea\u05dc \u05d0\u05d1\u05d9\u05d1' },
          { year: 2022, title: '\u05e4\u05e8\u05e1\u05d5\u05de\u05ea \u05dc\u05d1\u05e0\u05e7', credit_role: '\u05dc\u05e7\u05d5\u05d7\u05d4 \u05de\u05e8\u05d5\u05e6\u05d4', credit_type: '\u05d8\u05dc\u05d5\u05d5\u05d9\u05d6\u05d9\u05d4 / \u05de\u05e1\u05d7\u05e8\u05d9' },
          { year: 2021, title: '\u05e8\u05d5\u05de\u05d9\u05d0\u05d5 \u05d5\u05d9\u05d5\u05dc\u05d9\u05d4', credit_role: '\u05d9\u05d5\u05dc\u05d9\u05d4', credit_type: '\u05ea\u05d9\u05d0\u05d8\u05e8\u05d5\u05df \u05d4\u05e4\u05e8\u05d9\u05e0\u05d2\u05f3' },
        ];
        for (const c of actorCredits) {
          db.run('INSERT INTO credits (id, user_id, year, title, credit_role, credit_type) VALUES (?, ?, ?, ?, ?, ?)',
            [uuidv4(), u.id, c.year, c.title, c.credit_role, c.credit_type]);
        }
        console.log(`    Added ${actorCredits.length} credits`);
      }
    } else {
      console.log(`  Skipped: ${u.name} (already exists)`);
    }
  }

  // Insert sample jobs from the agent user
  const agentStmt = db.prepare('SELECT id FROM users WHERE role = ?');
  agentStmt.bind(['agent']);
  let agentId = null;
  if (agentStmt.step()) agentId = agentStmt.getAsObject().id;
  agentStmt.free();

  if (agentId) {
    const existingJobs = db.prepare('SELECT COUNT(*) as count FROM jobs');
    existingJobs.bind();
    existingJobs.step();
    const jobCount = existingJobs.getAsObject().count;
    existingJobs.free();

    if (jobCount === 0) {
      const jobs = [
        { title: '\u05e9\u05d7\u05e7\u05e0\u05d9\u05ea \u05e8\u05d0\u05e9\u05d9\u05ea \u05dc\u05e1\u05d3\u05e8\u05ea \u05e8\u05e9\u05ea', description: '\u05de\u05d7\u05e4\u05e9\u05d9\u05dd \u05e9\u05d7\u05e7\u05e0\u05d9\u05ea \u05d1\u05d2\u05d9\u05dc\u05d0\u05d9 20-25, \u05d1\u05e2\u05dc\u05ea \u05d9\u05db\u05d5\u05dc\u05d5\u05ea \u05e7\u05d5\u05de\u05d9\u05d5\u05ea, \u05dc\u05e1\u05d3\u05e8\u05ea \u05e8\u05e9\u05ea \u05d7\u05d3\u05e9\u05d4.', category: 'acting', location: '\u05ea\u05dc \u05d0\u05d1\u05d9\u05d1', job_type: 'contract', compensation: '\u05d1\u05ea\u05e9\u05dc\u05d5\u05dd' },
        { title: '\u05d3\u05e8\u05d5\u05e9 \u05d1\u05de\u05d0\u05d9/\u05ea \u05dc\u05e7\u05dc\u05d9\u05e4 \u05de\u05d5\u05d6\u05d9\u05e7\u05dc\u05d9', description: '\u05dc\u05d4\u05e7\u05ea \u05e8\u05d5\u05e7 \u05d0\u05dc\u05d8\u05e8\u05e0\u05d8\u05d9\u05d1\u05d9\u05ea \u05de\u05d7\u05e4\u05e9\u05ea \u05d1\u05de\u05d0\u05d9/\u05ea \u05e2\u05dd \u05d7\u05d6\u05d5\u05df \u05d5\u05d9\u05d6\u05d5\u05d0\u05dc\u05d9 \u05d9\u05d9\u05d7\u05d5\u05d3\u05d9.', category: 'directing', location: '\u05de\u05e8\u05db\u05d6 \u05d4\u05d0\u05e8\u05e5', job_type: 'freelance', compensation: '\u05ea\u05e7\u05e6\u05d9\u05d1 \u05e2\u05e6\u05de\u05d0\u05d9' },
        { title: '\u05e0\u05d9\u05e6\u05d1\u05d9\u05dd \u05dc\u05e1\u05e8\u05d8 \u05e7\u05d5\u05dc\u05e0\u05d5\u05e2 \u05ea\u05e7\u05d5\u05e4\u05ea\u05d9', description: '\u05dc\u05e1\u05e8\u05d8 \u05e1\u05d8\u05d5\u05d3\u05e0\u05d8\u05d9\u05dd \u05d4\u05de\u05ea\u05e8\u05d7\u05e9 \u05d1\u05e9\u05e0\u05d5\u05ea \u05d4-60, \u05de\u05d7\u05e4\u05e9\u05d9\u05dd \u05e0\u05d9\u05e6\u05d1\u05d9\u05dd \u05d1\u05db\u05dc \u05d4\u05d2\u05d9\u05dc\u05d0\u05d9\u05dd.', category: 'extras', location: '\u05d9\u05e8\u05d5\u05e9\u05dc\u05d9\u05dd', job_type: 'volunteer', compensation: '\u05d4\u05ea\u05e0\u05d3\u05d1\u05d5\u05ea/\u05e7\u05e8\u05d3\u05d9\u05d8' },
      ];
      for (const j of jobs) {
        db.run('INSERT INTO jobs (id, user_id, title, description, category, location, job_type, compensation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [uuidv4(), agentId, j.title, j.description, j.category, j.location, j.job_type, j.compensation]);
        console.log(`  Job: ${j.title}`);
      }
    } else {
      console.log('  Jobs already exist, skipping.');
    }
  }

  // Save
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  console.log('\n\u2705 Seed complete! DB saved to:', DB_PATH);
  console.log('   All test accounts use password: password123\n');
}

seed().catch(err => { console.error('\u274c Seed failed:', err); process.exit(1); });
