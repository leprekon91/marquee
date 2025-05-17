import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initCategorysTable, initPerformersTable, initSettingsTable } from './initDB';
import { logError } from '../middleware/errorHandler';

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
      logError(err instanceof Error ? err : new Error('Failed to initialize database'));
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
    const error = err instanceof Error ? err : new Error('Failed to initialize database schema');
    logError(error);
    throw error;
  }
}

// Close database connection when app is shutting down
process.on('SIGINT', () => {
  if (db) {
    try {
      db.close();
      console.log('Database connection closed');
    } catch (err) {
      logError(err instanceof Error ? err : new Error('Error closing database connection'));
    }
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (db) {
    try {
      db.close();
      console.log('Database connection closed');
    } catch (err) {
      logError(err instanceof Error ? err : new Error('Error closing database connection'));
    }
  }
});