// CRUD for categories table
import { Database } from 'better-sqlite3';
import { Category } from '../types/performers';
import { getDB } from '../db/database';

// Function to get all categories
export function getAllCategories(): Category[] {
    const db: Database = getDB();
    const stmt = db.prepare('SELECT * FROM categories');
    const categories: Category[] = stmt.all() as Category[];
    return categories;
}

// Function to get a category by ID
export function getCategoryById(id: string): Category | null {
    const db: Database = getDB();
    const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
    const category: Category | undefined = stmt.get(id) as Category | undefined;
    return category || null;
}

// Function to add a new category
export function addCategory(name: string): Category {
    const db: Database = getDB();
    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    const info = stmt.run(name);
    const newCategory: Category = {
        id: info.lastInsertRowid.toString(),
        name,
    };
    return newCategory;
}

// Function to update a category
export function updateCategory(id: string, name: string): Category | null {
    const db: Database = getDB();
    const stmt = db.prepare('UPDATE categories SET name = ? WHERE id = ?');
    const info = stmt.run(name, id);
    if (info.changes === 0) {
        return null; // No category found with the given ID
    }
    const updatedCategory: Category = {
        id,
        name,
    };
    return updatedCategory;
}

// Function to delete a category
export function deleteCategory(id: string): boolean {
    const db: Database = getDB();
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0; // Return true if a category was deleted
}