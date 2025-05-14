import { Database } from 'better-sqlite3';
import { initializeSettings } from '../services/settingsService';

export function initSettingsTable(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );
  `);

  // Insert default settings if they don't exist
  initializeSettings();
}

export function initPerformersTable(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS performers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      "order" INTEGER NOT NULL,
      name TEXT NOT NULL,
      club TEXT,
      category_id INTEGER,
      routine TEXT
    );
  `);
}

export function initCategorysTable(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);
}
