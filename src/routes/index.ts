import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {getSettings, setSetting, resetSettingsController, uploadLogoController} from '../controllers/settingsController';
import { Request, Response } from 'express';
import { 
  getPerformers, 
  getPerformer, 
  createPerformer, 
  patchPerformer, 
  removePerformer,
  importPerformersFromCsv,
  exportPerformersAsCsv
} from '../controllers/performersController';
import { getCategory, getCategories, createCategory, patchCategory, removeCategory } from '../controllers/categoryController';
import { retrieveDisplaySettings, advanceToNextPerformer, overrideCurrentPerformer, changeCategory, changeDisplayType } from '../controllers/displayController';
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Create a unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

// Configure multer for in-memory storage (for CSV files)
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only CSV files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// settings routes
router.get('/settings', getSettings);
router.post('/settings', setSetting);
router.post('/settings/reset', resetSettingsController);
router.post('/settings/upload-logo', upload.single('logo'), uploadLogoController);

// Serve static files from uploads directory
router.use('/uploads', express.static(uploadsDir));

//category routes
router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.post('/categories', createCategory);
router.patch('/categories/:id', patchCategory);
router.delete('/categories/:id', removeCategory);

// performers routes
router.get('/performers', getPerformers);
router.get('/performers/export-csv', exportPerformersAsCsv);
router.get('/performers/:id', getPerformer);
router.post('/performers', createPerformer);
router.post('/performers/import-csv', csvUpload.single('file'), importPerformersFromCsv);
router.patch('/performers/:id', patchPerformer);
router.delete('/performers/:id', removePerformer);

// display control routes
router.get('/display', retrieveDisplaySettings);
router.post('/display/next-performer', advanceToNextPerformer);
router.post('/display/current-performer', overrideCurrentPerformer);
router.post('/display/category/:categoryId', changeCategory);
router.post('/display/type', changeDisplayType);

export default router;