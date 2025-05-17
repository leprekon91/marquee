// use settingsService to get and set settings
import { Request, Response } from 'express';
import { getCurrentSettings, setSetting as setSettingService, resetSettings } from '../services/settingsService';
import { SettingKey } from '../types/settings';
import { ApiError } from '../middleware/errorHandler';

// Function to get all settings
export async function getSettings(req: Request, res: Response): Promise<void> {
    try {
        const settings = getCurrentSettings();
        res.json(settings);
    } catch (error) {
        throw error instanceof Error 
            ? new ApiError(500, error.message)
            : new ApiError(500, 'Failed to retrieve settings');
    }
}

// Function to set a setting
export async function setSetting(req: Request, res: Response): Promise<void> {
    try {
        const { key, value } = req.body;
        setSettingService(key, value);
        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        throw error instanceof Error 
            ? new ApiError(500, error.message)
            : new ApiError(500, 'Failed to update setting');
    }
}

// Function to reset settings to default values
export async function resetSettingsController(req: Request, res: Response): Promise<void> {
    try {
        resetSettings();
        const settings = getCurrentSettings();
        res.json({ message: 'Settings reset successfully', settings });
    } catch (error) {
        throw error instanceof Error 
            ? new ApiError(500, error.message)
            : new ApiError(500, 'Failed to reset settings');
    }
}

// Function to handle logo uploads
export async function uploadLogoController(req: Request, res: Response): Promise<void> {
    if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
    }

    try {
        const { key } = req.body;
        
        if (!key) {
            throw new ApiError(400, 'Setting key is required');
        }
        
        // Check if key is a valid logo setting
        if (
            key !== SettingKey.DISPLAY_LOGO_LEFT && 
            key !== SettingKey.DISPLAY_LOGO_RIGHT && 
            key !== SettingKey.DISPLAY_LOGO_CENTER
        ) {
            throw new ApiError(400, 'Invalid logo setting key');
        }

        const filePath = `/uploads/${req.file.filename}`;
        setSettingService(key as SettingKey, filePath);
        
        res.json({
            message: 'Logo uploaded successfully',
            path: filePath
        });
    } catch (error) {
        throw error instanceof Error 
            ? new ApiError(500, error.message)
            : new ApiError(500, 'Failed to upload logo');
    }
}
