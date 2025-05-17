import { Database } from 'better-sqlite3';
import { Performer } from '../types/performers';
import { getDB } from '../db/database';
import { getCategoryById } from './categoryService';
import { getSettingValue, setSetting } from './settingsService';
import { SettingKey } from '../types/settings';

// Function to get all performers
export function getAllPerformers(): Performer[] {
  const db: Database = getDB();
  const stmt = db.prepare('SELECT * FROM performers');
  const performers: Performer[] = stmt.all() as Performer[];
  return performers;
}

// Function to get a performer by ID
export function getPerformerById(id: number): Performer | null {
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
export function addPerformer(
  order: string,
  name: string,
  club: string,
  categoryId: number,
  routine: string,
): Performer | null {
  const db: Database = getDB();
  const category = getCategoryById(categoryId);
  if (!category) {
    throw new Error('Category does not exist'); // Category does not exist
  }
  const stmt = db.prepare(
    'INSERT INTO performers ("order", name, club, category_id, "routine") VALUES (?, ?, ?, ?, ?)',
  );
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
export function updatePerformer(
  id: string,
  order: string,
  name: string,
  club: string,
  categoryId: number,
  routine: string,
): Performer | null {
  const db: Database = getDB();
  const category = getCategoryById(categoryId);
  if (!category) {
    throw new Error('Category does not exist'); // Category does not exist
  }
  const stmt = db.prepare(
    'UPDATE performers SET "order" = ?, name = ?, club = ?, category_id = ?, "routine" = ? WHERE id = ?',
  );
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

  const currentPerformer = getSettingValue(SettingKey.CURRENT_PERFORMER);
  if (currentPerformer === id) {
    setSetting(SettingKey.CURRENT_PERFORMER, '0');
  }

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

export function importPerformers(
  performers: {
    name: string;
    club: string;
    categoryName: string;
    routine: string;
  }[],
) {
  // delete all performers
  const db: Database = getDB();
  const deleteStmt = db.prepare('DELETE FROM performers');
  deleteStmt.run();
  // delete all categories
  const deleteCategoryStmt = db.prepare('DELETE FROM categories');
  deleteCategoryStmt.run();
  // reset CURRENT_PERFORMER and CURRENT_CATEGORY settings
  setSetting(SettingKey.CURRENT_DISPLAY, 'title');
  setSetting(SettingKey.CURRENT_PERFORMER, 0);
  setSetting(SettingKey.CURRENT_CATEGORY, 0);

  // get all unique category names
  const categories = performers.map((performer) => performer.categoryName);
  const uniqueCategories = [...new Set(categories)];

  // insert unique categories into the database
  const insertCategoryStmt = db.prepare('INSERT INTO categories (name) VALUES (?)');

  const categoryIds: { [key: string]: number } = {};
  uniqueCategories.forEach((category) => {
    const info = insertCategoryStmt.run(category);
    categoryIds[category] = info.lastInsertRowid as number;
  });

  // insert performers into the database
  const insertPerformerStmt = db.prepare(
    'INSERT INTO performers (name, "order", club, category_id, routine) VALUES (?, ?, ?, ?, ?)',
  );

  performers.forEach((performer) => {
    const categoryId = categoryIds[performer.categoryName];
    // find biggest order number in the category
    const maxOrderStmt = db.prepare(
      'SELECT MAX("order") as maxOrder FROM performers WHERE category_id = ?',
    );
    const { maxOrder } = maxOrderStmt.get(categoryId) as { maxOrder: number };
    const order = maxOrder ? Number(maxOrder) + 1 : 1;
    if (categoryId) {
      insertPerformerStmt.run(performer.name, order, performer.club, categoryId, performer.routine);
    }
  });

  return true; // Return true if performers were imported successfully
}

export function exportPerformers(): {
  name: string;
  club: string;
  categoryName: string;
  routine: string;
}[] {
  const db: Database = getDB();
  const stmt = db.prepare(
    'SELECT performers.name, performers.club, categories.name as categoryName, performers.routine FROM performers JOIN categories ON performers.category_id = categories.id',
  );
  const performers = stmt.all() as {
    name: string;
    club: string;
    categoryName: string;
    routine: string;
  }[];
  return performers;
}
