// use settingsService to get and set settings
import { Request, Response } from 'express';

import { getCurrentSettings, setSettingValue, resetSettings } from '../services/settingsService';
import { SettingKey } from '../types/settings';


// Function to get all settings
export function getSettings(req: Request, res: Response): void {
    const settings = getCurrentSettings();
    res.json(settings);
}

// Function to set a setting
export function setSetting(req: Request, res: Response): void {
    const { key, value } = req.body;
    if (!key || !value) {
        res.status(400).json({ error: 'Key and value are required' });
        return;
    }
    if (!Object.values(SettingKey).includes(key)) {
        res.status(400).json({ error: 'Invalid setting key' });
        return;
    }
    setSettingValue(key, value);
    res.json({ message: 'Setting updated successfully' });
}

// Function to reset settings to default values
export function resetSettingsController(req: Request, res: Response): void {
    resetSettings();
    res.json({ message: 'Settings reset to default values' });
}
