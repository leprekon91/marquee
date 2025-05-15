// use performerService to manage performers
import { Request, Response } from 'express';

import {
    getAllPerformers,
    getPerformerById,
    getPerformersByCategoryId,
    addPerformer,
    updatePerformer,
    deletePerformer,
    importPerformers,
    exportPerformers
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
        const performer = getPerformerById(Number.parseInt(id));
        
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

// Function to import performers from CSV
export function importPerformersFromCsv(req: Request, res: Response): void {
    if (!req.file) {
        res.status(400).json({ error: 'No CSV file uploaded' });
        return;
    }

    try {
        // Parse the CSV file content
        const fileContent = req.file.buffer.toString();
        const lines = fileContent.split('\n');
        
        // Extract header and validate required columns
        const header = lines[0].split(',');
        const nameIndex = header.findIndex(col => col.trim().toLowerCase() === 'name');
        const clubIndex = header.findIndex(col => col.trim().toLowerCase() === 'club');
        const categoryIndex = header.findIndex(col => col.trim().toLowerCase() === 'category');
        const routineIndex = header.findIndex(col => col.trim().toLowerCase() === 'routine');
        
        if (nameIndex === -1 || clubIndex === -1 || categoryIndex === -1) {
            res.status(400).json({ error: 'CSV file must contain name, club, and category columns' });
            return;
        }
        
        // Parse data rows
        const performersData = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines
            
            const columns = line.split(',');
            if (columns.length < Math.max(nameIndex, clubIndex, categoryIndex) + 1) {
                continue; // Skip invalid rows
            }
            
            const name = columns[nameIndex].trim();
            const club = columns[clubIndex].trim();
            const categoryName = columns[categoryIndex].trim();
            const routine = routineIndex !== -1 ? columns[routineIndex].trim() : '';
            
            if (name && club && categoryName) {
                performersData.push({
                    name,
                    club,
                    categoryName,
                    routine
                });
            }
        }
        
        if (performersData.length === 0) {
            res.status(400).json({ error: 'No valid performer data found in CSV' });
            return;
        }
        
        // Call the import function
        const success = importPerformers(performersData);
        
        if (success) {
            res.json({ message: `Successfully imported ${performersData.length} performers` });
        } else {
            res.status(500).json({ error: 'Failed to import performers' });
        }
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: `Failed to import performers: ${error.message}` });
        } else {
            res.status(500).json({ error: 'Failed to import performers' });
        }
    }
}

// Function to export performers as CSV
export function exportPerformersAsCsv(req: Request, res: Response): void {
    try {
        const performers = exportPerformers();
        
        if (performers.length === 0) {
            res.status(404).json({ error: 'No performers found to export' });
            return;
        }
        
        // Create CSV header and data rows
        const columns = ['name', 'club', 'category', 'routine'];
        const csvHeader = columns.join(',') + '\r\n';
        
        // Create CSV rows from performers data
        const csvRows = performers.map(performer => {
            return [
                // Escape quotes in data by doubling them and wrap in quotes if contains comma or quote
                escapeCSVField(performer.name),
                escapeCSVField(performer.club),
                escapeCSVField(performer.categoryName),
                escapeCSVField(performer.routine || '')
            ].join(',');
        }).join('\r\n');
        
        // Combine header and data rows
        const csvContent = csvHeader + csvRows;
        
        // Set headers for CSV file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="performers-export.csv"');
        
        // Send the CSV content
        res.send(csvContent);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: `Failed to export performers: ${error.message}` });
        } else {
            res.status(500).json({ error: 'Failed to export performers' });
        }
    }
}

// Helper function to properly escape CSV values
function escapeCSVField(value: string): string {
    // If the field contains a comma, newline, or double quote, wrap it in double quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        // Double any existing quotes
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

