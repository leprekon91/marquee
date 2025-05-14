// use performerService to manage performers
import { Request, Response } from 'express';

import {
    getAllPerformers,
    getPerformerById,
    getPerformersByCategoryId,
    addPerformer,
    updatePerformer,
    deletePerformer
} from '../services/performerService';
import { Performer } from '../types/performers';

// Function to get all performers
export function getPerformers(req: Request, res: Response): void {
    try {
        const { categoryId } = req.query;
        
        let performers: Performer[];
        
        if (categoryId && typeof categoryId === 'string') {
            performers = getPerformersByCategoryId(Number.parseInt(categoryId));
        } else {
            performers = getAllPerformers();
        }
        
        res.json(performers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve performers' });
    }
}

// Function to get a performer by ID
export function getPerformer(req: Request, res: Response): void {
    try {
        const { id } = req.params;
        const performer = getPerformerById(id);
        
        if (!performer) {
            res.status(404).json({ error: 'Performer not found' });
            return;
        }
        
        res.json(performer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve performer' });
    }
}

// Function to create a new performer
export function createPerformer(req: Request, res: Response): void {
    try {
        const { order, name, club, category_id, routine } = req.body;
        
        // Check for required fields
        if (!order || !name || !club || !category_id) {
            res.status(400).json({ error: 'Order, name, club, and category_id are required' });
            return;
        }
        
        // Default routine to empty string if not provided
        const performerRoutine = routine || '';
        
        const newPerformer = addPerformer(order, name, club, category_id, performerRoutine);
        res.status(201).json(newPerformer);
    } catch (error) {
        if (error instanceof Error && error.message === 'Category does not exist') {
            res.status(400).json({ error: 'Invalid category ID' });
        } else {
            res.status(500).json({ error: 'Failed to create performer' });
        }
    }
}

// Function to update a performer
export function patchPerformer(req: Request, res: Response): void {
    try {
        const { id } = req.params;
        const { order, name, club, category_id, routine } = req.body;
        
        // Check for required fields
        if (!order || !name || !club || !category_id) {
            res.status(400).json({ error: 'Order, name, club, and category_id are required' });
            return;
        }
        
        // Default routine to empty string if not provided
        const performerRoutine = routine || '';
        
        const updatedPerformer = updatePerformer(id, order, name, club, category_id, performerRoutine);
        
        if (!updatedPerformer) {
            res.status(404).json({ error: 'Performer not found' });
            return;
        }
        
        res.json(updatedPerformer);
    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === 'Category does not exist') {
                res.status(400).json({ error: 'Invalid category ID' });
            } else if (error.message === 'No performer found with the given ID') {
                res.status(404).json({ error: 'Performer not found' });
            } else {
                res.status(500).json({ error: 'Failed to update performer' });
            }
        } else {
            res.status(500).json({ error: 'Failed to update performer' });
        }
    }
}

// Function to delete a performer
export function removePerformer(req: Request, res: Response): void {
    try {
        const { id } = req.params;
        const isDeleted = deletePerformer(id);
        
        if (!isDeleted) {
            res.status(404).json({ error: 'Performer not found' });
            return;
        }
        
        res.json({ message: 'Performer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete performer' });
    }
}

