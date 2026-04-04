import { eq } from "drizzle-orm";
import { db } from "./db";
import { shelves, books, type Shelf, type InsertShelf, type Book, type InsertBook } from "@shared/schema";

export interface IStorage {
  getShelves(): Promise<Shelf[]>;
  getShelf(id: number): Promise<Shelf | undefined>;
  createShelf(shelf: InsertShelf): Promise<Shelf>;
  updateShelf(id: number, shelf: Partial<InsertShelf>): Promise<Shelf | undefined>;
  deleteShelf(id: number): Promise<boolean>;

  reorderShelves(orderedIds: number[]): Promise<void>;

  reorderBooks(shelfId: number, orderedIds: number[]): Promise<void>;

  getBooksByShelf(shelfId: number): Promise<Book[]>;
  getAllBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getShelves(): Promise<Shelf[]> {
    return db.select().from(shelves).orderBy(shelves.sortOrder);
  }

  async getShelf(id: number): Promise<Shelf | undefined> {
    const [shelf] = await db.select().from(shelves).where(eq(shelves.id, id));
    return shelf;
  }

  async createShelf(shelf: InsertShelf): Promise<Shelf> {
    const [created] = await db.insert(shelves).values(shelf).returning();
    return created;
  }

  async updateShelf(id: number, shelf: Partial<InsertShelf>): Promise<Shelf | undefined> {
    const [updated] = await db.update(shelves).set(shelf).where(eq(shelves.id, id)).returning();
    return updated;
  }

  async deleteShelf(id: number): Promise<boolean> {
    await db.delete(books).where(eq(books.shelfId, id));
    const result = await db.delete(shelves).where(eq(shelves.id, id)).returning();
    return result.length > 0;
  }

  async reorderShelves(orderedIds: number[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) =>
        db.update(shelves).set({ sortOrder: index }).where(eq(shelves.id, id))
      )
    );
  }

  async reorderBooks(shelfId: number, orderedIds: number[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) =>
        db.update(books).set({ sortOrder: index }).where(eq(books.id, id))
      )
    );
  }

  async getBooksByShelf(shelfId: number): Promise<Book[]> {
    return db.select().from(books).where(eq(books.shelfId, shelfId)).orderBy(books.sortOrder);
  }

  async getAllBooks(): Promise<Book[]> {
    return db.select().from(books);
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [created] = await db.insert(books).values(book).returning();
    return created;
  }

  async updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined> {
    const [updated] = await db.update(books).set(book).where(eq(books.id, id)).returning();
    return updated;
  }

  async deleteBook(id: number): Promise<boolean> {
    const result = await db.delete(books).where(eq(books.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
