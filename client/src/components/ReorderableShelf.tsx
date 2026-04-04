import { Reorder, useDragControls } from "framer-motion";
import BookShelf from "./BookShelf";
import type { Shelf, Book } from "@shared/schema";

type ShelfWithBooks = Shelf & { books: Book[] };

interface ReorderableShelfProps {
  shelf: ShelfWithBooks;
  onDeleteShelf: () => void;
  onDeleteBook: (bookId: number) => void;
  onEditShelf: () => void;
  onBookClick: (bookId: number) => void;
  onReorderBooks: (orderedIds: number[]) => void;
}

export default function ReorderableShelf({ shelf, onDeleteShelf, onDeleteBook, onEditShelf, onBookClick, onReorderBooks }: ReorderableShelfProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={shelf}
      dragListener={false}
      dragControls={controls}
      className="list-none"
      whileDrag={{ scale: 1.02, opacity: 0.9, zIndex: 50 }}
    >
      <BookShelf
        shelfId={shelf.id}
        title={shelf.name}
        count={shelf.books.length}
        books={shelf.books.map((b) => ({
          id: b.id,
          title: b.title,
          image: b.coverImage || "/covers/book1.png",
        }))}
        overlayColor={shelf.overlayColor}
        overlayBorder={shelf.overlayBorder}
        onDeleteShelf={onDeleteShelf}
        onDeleteBook={onDeleteBook}
        onEditShelf={onEditShelf}
        onBookClick={onBookClick}
        onReorderBooks={onReorderBooks}
        onDragHandlePointerDown={(e) => controls.start(e)}
      />
    </Reorder.Item>
  );
}
