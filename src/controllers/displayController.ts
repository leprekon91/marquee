import { Request, Response } from 'express';
import { getDisplaySettings, setNextPerformer, setCategory, switchDisplayType, setCurrentPerformer } from '../services/displayService';

// get current display settings and data
export function retrieveDisplaySettings(_: Request, res: Response): void {
  try {
    const settings = getDisplaySettings();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve display settings' });
  }
}

// set the next performer to be displayed
export function advanceToNextPerformer(_: Request, res: Response): void {
  try {
    const result = setNextPerformer();
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to set next performer' });
    }
  }
}

// override the current performer and set his category as the correct one
export function overrideCurrentPerformer(req: Request, res: Response): void {
  try {
    const { performerId } = req.body;
    setCurrentPerformer(performerId);
    res.status(200).json({ success: true, message: 'Current performer updated successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to set current performer' });
    }
  }
}

// change the current category
export function changeCategory(req: Request, res: Response): void {
  try {
    const { categoryId } = req.params;
    setCategory(categoryId);
    res.status(200).json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to set category' });
    }
  }
}

// switch the display type between performer and title
export function changeDisplayType(req: Request, res: Response): void {
  try {
    const { displayType } = req.body;
    
    if (!displayType || (displayType !== 'performer' && displayType !== 'title')) {
      res.status(400).json({ error: 'Invalid display type. Must be either "performer" or "title"' });
    }
    
    switchDisplayType(displayType);
    res.status(200).json({ success: true, message: `Display type changed to ${displayType}` });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to change display type' });
    }
  }
}


