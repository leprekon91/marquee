import { Database } from 'better-sqlite3';
import { Performer } from '../types/performers';
import { getDB } from '../db/database';
import { getCategoryById } from './categoryService';

// Function to get all performers
export function getAllPerformers(): Performer[] {
    const db: Database = getDB();
    const stmt = db.prepare('SELECT * FROM performers');
    const performers: Performer[] = stmt.all() as Performer[];
    return performers;
}

// Function to get a performer by ID
export function getPerformerById(id: string): Performer | null {
    const db: Database = getDB();
    const stmt = db.prepare('SELECT * FROM performers WHERE id = ?');
    const performer: Performer | undefined = stmt.get(id) as Performer | undefined;
    return performer || null;
}

// Function to get all performers by category ID
export function getPerformersByCategoryId(categoryId: number): Performer[] {
    const db: Database = getDB();
    const stmt = db.prepare('SELECT * FROM performers WHERE category_id = ? ORDER BY "order"');
    const performers: Performer[] = stmt.all(categoryId) as Performer[];
    return performers;
}

// Function to add a new performer
export function addPerformer(order: string, name: string, club: string, categoryId: number, routine: string): Performer | null {
    const db: Database = getDB();
    const category = getCategoryById(categoryId);
    if (!category) {
        throw new Error('Category does not exist'); // Category does not exist
    }
    const stmt = db.prepare('INSERT INTO performers ("order", name, club, category_id, "routine") VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(order, name, club, categoryId, routine);
    const newPerformer: Performer = {
        id: info.lastInsertRowid as number,
        order,
        name,
        club,
        category_id: categoryId,
        routine,
    };
    return newPerformer;
}

// Function to update a performer
export function updatePerformer(id: string, order: string, name: string, club: string, categoryId: number, routine: string): Performer | null {
    const db: Database = getDB();
    const category = getCategoryById(categoryId);
    if (!category) {
        throw new Error('Category does not exist'); // Category does not exist
    }
    const stmt = db.prepare('UPDATE performers SET "order" = ?, name = ?, club = ?, category_id = ?, "routine" = ? WHERE id = ?');
    const info = stmt.run(order, name, club, categoryId, routine, id);
    if (info.changes === 0) {
        throw new Error('No performer found with the given ID'); // No performer found with the given ID
    }
    const updatedPerformer: Performer = {
        id: Number.parseInt(id),
        order,
        name,
        club,
        category_id: categoryId,
        routine,
    };
    return updatedPerformer;
}

// Function to delete a performer
export function deletePerformer(id: string): boolean {
    const db: Database = getDB();
    const stmt = db.prepare('DELETE FROM performers WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0; // Return true if a performer was deleted
}

export function deletePerformersByCategoryId(id: string) {
    const db: Database = getDB();
    const stmt = db.prepare('DELETE FROM performers WHERE category_id = ?');
    const info = stmt.run(id);
    return info.changes > 0; // Return true if a performer was deleted
}
