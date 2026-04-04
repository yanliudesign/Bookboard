import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { insertShelfSchema, insertBookSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/covers", express.static(path.resolve(process.cwd(), "public/covers")));

  app.get("/api/shelves", async (_req, res) => {
    const allShelves = await storage.getShelves();
    const shelvesWithBooks = await Promise.all(
      allShelves.map(async (shelf) => {
        const shelfBooks = await storage.getBooksByShelf(shelf.id);
        return { ...shelf, books: shelfBooks };
      })
    );
    res.json(shelvesWithBooks);
  });

  app.post("/api/shelves", async (req, res) => {
    const parsed = insertShelfSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    const shelf = await storage.createShelf(parsed.data);
    res.status(201).json(shelf);
  });

  app.patch("/api/shelves/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateShelf(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Shelf not found" });
    }
    res.json(updated);
  });

  app.post("/api/shelves/reorder", async (req, res) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds must be an array" });
    }
    await storage.reorderShelves(orderedIds);
    res.json({ success: true });
  });

  app.delete("/api/shelves/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteShelf(id);
    if (!deleted) {
      return res.status(404).json({ message: "Shelf not found" });
    }
    res.json({ success: true });
  });

  app.get("/api/books/cover-search", async (req, res) => {
    const q = req.query.q as string;
    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }
    try {
      const searchRes = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(q.trim())}&limit=1&fields=cover_i`
      );
      if (!searchRes.ok) {
        return res.json({ coverUrl: null });
      }
      const data = await searchRes.json();
      if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
        const coverId = data.docs[0].cover_i;
        const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
        return res.json({ coverUrl });
      }
      return res.json({ coverUrl: null });
    } catch {
      return res.json({ coverUrl: null });
    }
  });

  app.post("/api/books/reorder", async (req, res) => {
    const { shelfId, orderedIds } = req.body;
    if (!shelfId || !Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "shelfId and orderedIds are required" });
    }
    await storage.reorderBooks(shelfId, orderedIds);
    res.json({ success: true });
  });

  app.post("/api/books", async (req, res) => {
    const parsed = insertBookSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    const book = await storage.createBook(parsed.data);
    res.status(201).json(book);
  });

  app.patch("/api/books/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateBook(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(updated);
  });

  app.delete("/api/books/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteBook(id);
    if (!deleted) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json({ success: true });
  });

  return httpServer;
}
