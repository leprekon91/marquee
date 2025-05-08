import { getDB } from '../db/database';
import { Database } from 'better-sqlite3';
import { Setting , SettingKey , getDefaultSettingValue ,getDefaultSettings } from '../types/settings';

export function getCurrentSettings(): Setting[] {
    const db: Database = getDB();
    const stmt = db.prepare('SELECT * FROM settings');
    const settings: Setting[] = stmt.all() as Setting[];
    return settings;
}

export function setSetting(key: SettingKey, value: string): void {
    const db: Database = getDB();
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    stmt.run(key, value);
}

export function getSettingValue(key: SettingKey): string {
    const db: Database = getDB();
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const setting: Setting | undefined = stmt.get(key) as Setting | undefined;
    return setting ? setting.value : getDefaultSettingValue(key);
}

export function setSettingValue(key: SettingKey, value: string): void {
    const db: Database = getDB();
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    stmt.run(key, value);
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
    const stmt = db.prepare('DELETE FROM settings');
    stmt.run();
    initializeSettings();
}