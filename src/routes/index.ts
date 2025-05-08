import express from 'express';
import  {getSettings, setSetting, resetSettingsController} from '../controllers/settingsController';
import { getPerformers, getPerformer, createPerformer, patchPerformer, removePerformer } from '../controllers/performersController';
import { getCategory, getCategories, createCategory,removeCategory } from '../controllers/categoryController';
import { retrieveDisplaySettings, advanceToNextPerformer, changeCategory, changeDisplayType } from '../controllers/displayController';
const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// settings routes
router.get('/settings', getSettings);
router.post('/settings', setSetting);
router.post('/settings/reset', resetSettingsController);

//category routes
router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.post('/categories', createCategory);
router.delete('/categories/:id', removeCategory);

// performers routes
router.get('/performers', getPerformers);
router.get('/performers/:id', getPerformer);
router.post('/performers', createPerformer);
router.patch('/performers/:id', patchPerformer);
router.delete('/performers/:id', removePerformer);

// display control routes
router.get('/display', retrieveDisplaySettings);
router.post('/display/next-performer', advanceToNextPerformer);
router.post('/display/category/:categoryId', changeCategory);
router.post('/display/type', changeDisplayType);

export default router;