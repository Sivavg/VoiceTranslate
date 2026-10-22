const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(dbDir, 'transcriptions.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode & foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS transcriptions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      language TEXT DEFAULT 'en-IN',
      duration_seconds INTEGER DEFAULT 0,
      word_count INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      is_favorite INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transcription_sessions (
      id TEXT PRIMARY KEY,
      transcription_id TEXT,
      raw_transcript TEXT NOT NULL,
      confidence REAL DEFAULT 0.0,
      is_final INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transcription_id) REFERENCES transcriptions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_transcriptions_created 
      ON transcriptions(created_at DESC);
    
    CREATE INDEX IF NOT EXISTS idx_sessions_transcription 
      ON transcription_sessions(transcription_id);
  `);

  console.log('✅ SQLite Database initialized successfully with node:sqlite');
}

// Ensure tables are created BEFORE preparing statements
initializeDatabase();

// CRUD operations for transcriptions
const transcriptionQueries = {
  // CREATE
  create: db.prepare(`
    INSERT INTO transcriptions (id, title, content, language, duration_seconds, word_count, tags, is_favorite)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),

  // READ ALL
  findAll: db.prepare(`
    SELECT * FROM transcriptions ORDER BY created_at DESC
  `),

  // READ ONE
  findById: db.prepare(`
    SELECT * FROM transcriptions WHERE id = ?
  `),

  // SEARCH
  search: db.prepare(`
    SELECT * FROM transcriptions 
    WHERE title LIKE ? OR content LIKE ?
    ORDER BY created_at DESC
  `),

  // UPDATE
  update: db.prepare(`
    UPDATE transcriptions 
    SET title = ?, content = ?, language = ?, tags = ?, is_favorite = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // DELETE
  delete: db.prepare(`
    DELETE FROM transcriptions WHERE id = ?
  `),

  // TOGGLE FAVORITE
  toggleFavorite: db.prepare(`
    UPDATE transcriptions SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END
    WHERE id = ?
  `),

  // STATS
  getStats: db.prepare(`
    SELECT 
      COUNT(*) as total_transcriptions,
      COALESCE(SUM(word_count), 0) as total_words,
      COALESCE(SUM(duration_seconds), 0) as total_duration,
      COUNT(CASE WHEN is_favorite = 1 THEN 1 END) as favorites
    FROM transcriptions
  `),

  // GET RECENT
  getRecent: db.prepare(`
    SELECT * FROM transcriptions ORDER BY created_at DESC LIMIT 5
  `)
};

// Session queries
const sessionQueries = {
  create: db.prepare(`
    INSERT INTO transcription_sessions (id, transcription_id, raw_transcript, confidence, is_final)
    VALUES (?, ?, ?, ?, ?)
  `),

  findByTranscription: db.prepare(`
    SELECT * FROM transcription_sessions WHERE transcription_id = ? ORDER BY timestamp
  `)
};

module.exports = {
  db,
  initializeDatabase,
  transcriptionQueries,
  sessionQueries
};
