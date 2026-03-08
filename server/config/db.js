const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'showz.db');

let db = null;

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  // Load existing DB file if it exists
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'actor',
      bio TEXT DEFAULT '',
      skills TEXT DEFAULT '',
      location TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      showreel TEXT DEFAULT '',
      website TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      height TEXT DEFAULT '',
      eye_color TEXT DEFAULT '',
      hair_color TEXT DEFAULT '',
      languages TEXT DEFAULT '',
      company_name TEXT DEFAULT '',
      equipment TEXT DEFAULT '',
      genres TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Credits table for actor filmography
  db.run(`
    CREATE TABLE IF NOT EXISTS credits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      year INTEGER,
      title TEXT NOT NULL,
      credit_role TEXT DEFAULT '',
      credit_type TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Migrate existing DBs: add new columns if they don't exist
  const cols = queryAll(db, "PRAGMA table_info(users)").map(c => c.name);
  const newCols = [
    ['height', "TEXT DEFAULT ''"],
    ['eye_color', "TEXT DEFAULT ''"],
    ['hair_color', "TEXT DEFAULT ''"],
    ['languages', "TEXT DEFAULT ''"],
    ['company_name', "TEXT DEFAULT ''"],
    ['equipment', "TEXT DEFAULT ''"],
    ['genres', "TEXT DEFAULT ''"],
  ];
  for (const [name, type] of newCols) {
    if (!cols.includes(name)) {
      db.run(`ALTER TABLE users ADD COLUMN ${name} ${type}`);
    }
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT 'acting',
      location TEXT DEFAULT '',
      job_type TEXT DEFAULT 'full-time',
      compensation TEXT DEFAULT '',
      requirements TEXT DEFAULT '',
      contact_email TEXT DEFAULT '',
      is_open INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS conversation_participants (
      conversation_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      PRIMARY KEY (conversation_id, user_id),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      cv_file TEXT DEFAULT '',
      message TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      title TEXT NOT NULL,
      body TEXT DEFAULT '',
      data TEXT DEFAULT '',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  saveDb();
  return db;
}

// Helper: run a SELECT query with params, return array of objects
function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper: run a SELECT query, return single row as object or null
function queryOne(db, sql, params = []) {
  const rows = queryAll(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper: run INSERT/UPDATE/DELETE with params
function runSql(db, sql, params = []) {
  db.run(sql, params);
}

// Legacy helpers for backward compat (used by seed.js)
function rowsToObjects(result) {
  if (!result || result.length === 0) return [];
  const stmt = result[0];
  return stmt.values.map(row => {
    const obj = {};
    stmt.columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

function rowToObject(result) {
  const rows = rowsToObjects(result);
  return rows.length > 0 ? rows[0] : null;
}

module.exports = { getDb, saveDb, queryAll, queryOne, runSql, rowsToObjects, rowToObject };
