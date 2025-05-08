import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initCategorysTable, initPerformersTable, initSettingsTable } from './initDB';

// Use environment variable for database directory with fallback to project root
const dbDir = process.env.DB_PATH 
  ? path.resolve(process.env.DB_PATH) 
  : path.join(process.cwd(), 'data');

// Ensure the data directory exists
if (!fs.existsSync(dbDir)) {
  console.log(`Creating database directory: ${dbDir}`);
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const DB_PATH = path.join(dbDir, 'database.sqlite');
console.log(`Database path: ${DB_PATH}`);

// Create and initialize database connection
let db: Database.Database;

export function getDB(): Database.Database {
  if (!db) {
    try {
      db = new Database(DB_PATH);
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
    } catch (err) {
      console.error('Failed to initialize database:', err);
      throw err;
    }
  }
  return db;
}

// Initialize database schema
export function initDB(): void {
  try {
    const db = getDB();
    
    // Initialize tables
    initSettingsTable(db);
    initCategorysTable(db);
    initPerformersTable(db);
    
    console.log('Database initialized with path:', DB_PATH);
  } catch (err) {
    console.error('Error initializing database schema:', err);
    throw err;
  }
}

// Close database connection when app is shutting down
process.on('SIGINT', () => {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
});