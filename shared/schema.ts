import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shelves = pgTable("shelves", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  overlayColor: text("overlay_color").notNull().default("rgba(255, 140, 0, 0.45)"),
  overlayBorder: text("overlay_border").notNull().default("rgba(255, 120, 0, 0.9)"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  coverImage: text("cover_image"),
  description: text("description"),
  shelfId: integer("shelf_id").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertShelfSchema = createInsertSchema(shelves).omit({ id: true });
export const insertBookSchema = createInsertSchema(books).omit({ id: true });

export type InsertShelf = z.infer<typeof insertShelfSchema>;
export type Shelf = typeof shelves.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;
