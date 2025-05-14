// use settingsService to get and set settings
import { Request, Response } from 'express';

import * as settingsService from '../services/settingsService';
import { SettingKey } from '../types/settings';

// Function to get all settings
export function getSettings(req: Request, res: Response): void {
  const settings = settingsService.getCurrentSettings();
  res.json(settings);
}

// Function to set a setting
export function setSetting(req: Request, res: Response): void {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    res.status(400).json({ error: 'Key and value are required' });
    return;
  }

  if (!Object.values(SettingKey).includes(key)) {
    res.status(400).json({ error: 'Invalid setting key' });
    return;
  }

  settingsService.setSetting(key, value);
  res.json({ message: 'Setting updated successfully' });
}

// Function to reset settings to default values
export function resetSettingsController(req: Request, res: Response): void {
  settingsService.resetSettings();
  res.json({ message: 'Settings reset to default values' });
}

// Function to handle logo uploads
export function uploadLogoController(req: Request, res: Response): void {
  try {
    const file = req.file;
    const { key } = req.body;
    
    // Validate request
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    
    if (!key) {
      res.status(400).json({ error: 'Setting key is required' });
      return;
    }
    
    // Check if the key is valid
    if (
      key !== SettingKey.DISPLAY_LOGO_LEFT && 
      key !== SettingKey.DISPLAY_LOGO_RIGHT && 
      key !== SettingKey.DISPLAY_LOGO_CENTER
    ) {
      res.status(400).json({ error: 'Invalid logo setting key' });
      return;
    }
    
    // Set the setting with the path to the uploaded file
    const filePath = `/uploads/${file.filename}`;
    settingsService.setSetting(key as SettingKey, filePath);
    
    res.json({
      message: 'Logo uploaded successfully',
      path: filePath
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
}
