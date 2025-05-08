// use categoryService to manage categories
import { Request, Response } from 'express';

import { 
    getAllCategories, 
    getCategoryById, 
    addCategory, 
    updateCategory, 
    deleteCategory 
} from '../services/categoryService';
import { Category } from '../types/performers';

// Function to get all categories
export function getCategories(req: Request, res: Response): void {
    try {
        const categories = getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve categories' });
    }
}

// Function to get a category by ID
export function getCategory(req: Request, res: Response): void {
    try {
        const { id } = req.params;
        const category = getCategoryById(id);
        
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve category' });
    }
}

// Function to create a new category
export function createCategory(req: Request, res: Response): void {
    try {
        const { name } = req.body;
        
        if (!name) {
            res.status(400).json({ error: 'Category name is required' });
            return;
        }
        
        const newCategory = addCategory(name);
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
}

// Function to update a category
export function patchCategory(req: Request, res: Response): void {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        if (!name) {
            res.status(400).json({ error: 'Category name is required' });
            return;
        }
        
        const updatedCategory = updateCategory(id, name);
        
        if (!updatedCategory) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
}

// Function to delete a category
export function removeCategory(req: Request, res: Response): void {
    try {
        const { id } = req.params;
        const isDeleted = deleteCategory(id);
        
        if (!isDeleted) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
}