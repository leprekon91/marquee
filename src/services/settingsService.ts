import { getDB } from '../db/database';
import { Database } from 'better-sqlite3';
import { Setting, SettingKey, getDefaultSettingValue, getDefaultSettings } from '../types/settings';

export function getCurrentSettings(): Setting[] {
  const db: Database = getDB();
  const stmt = db.prepare('SELECT * FROM settings');
  const settings: Setting[] = stmt.all() as Setting[];
  return settings;
}

export function setSetting(key: SettingKey, value: string): void {
  const db: Database = getDB();
  const existingSettingStmt = db.prepare('SELECT 1 FROM settings WHERE key = ?');
  const exists = existingSettingStmt.get(key);

  if (!exists) {
    throw new Error(`Setting with key "${key}" does not exist.`);
  }

  const stmt = db.prepare('UPDATE settings SET value = ? WHERE key = ?');

  const response = stmt.run(value, key);

  if (response.changes === 0) {
    throw new Error(`Failed to update setting with key "${key}".`);
  }
}

export function getSettingValue(key: SettingKey): string {
  const db: Database = getDB();
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const setting: Setting | undefined = stmt.get(key) as Setting | undefined;
  return setting ? setting.value : getDefaultSettingValue(key);
}

export function initializeSettings(): void {
  const db: Database = getDB();
  const defaultSettings: Setting[] = getDefaultSettings();
  const stmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  defaultSettings.forEach((setting) => {
    stmt.run(setting.key, setting.value);
  });
}

export function resetSettings(): void {
  const db: Database = getDB();
  const ignoredKeys = [
    SettingKey.CURRENT_DISPLAY,
    SettingKey.CURRENT_CATEGORY,
    SettingKey.CURRENT_PERFORMER,
  ];
  // Create proper placeholders for each key
  const placeholders = ignoredKeys.map(() => '?').join(', ');
  const stmt = db.prepare(`DELETE FROM settings WHERE settings.key NOT IN (${placeholders})`);
  stmt.run(...ignoredKeys);
  initializeSettings();
}
