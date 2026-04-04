import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Reorder } from "framer-motion";
import ReorderableShelf from "@/components/ReorderableShelf";
import { Battery, Wifi, Signal, Plus, BookOpen } from "lucide-react";
import type { Shelf, Book } from "@shared/schema";
import AddShelfModal from "@/components/AddShelfModal";
import AddBookModal from "@/components/AddBookModal";
import EditShelfModal from "@/components/EditShelfModal";
import BookDetailModal from "@/components/BookDetailModal";

type ShelfWithBooks = Shelf & { books: Book[] };

export default function Home() {
  const [showAddShelf, setShowAddShelf] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingShelf, setEditingShelf] = useState<ShelfWithBooks | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [orderedShelves, setOrderedShelves] = useState<ShelfWithBooks[]>([]);

  const { data: shelves = [], isLoading } = useQuery<ShelfWithBooks[]>({
    queryKey: ["/api/shelves"],
  });

  useEffect(() => {
    if (shelves.length > 0) {
      setOrderedShelves(shelves);
    }
  }, [shelves]);

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: number[]) => {
      await apiRequest("POST", "/api/shelves/reorder", { orderedIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shelves"] });
    },
  });

  const deleteShelfMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/shelves/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shelves"] });
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shelves"] });
    },
  });

  const reorderBooksMutation = useMutation({
    mutationFn: async ({ shelfId, orderedIds }: { shelfId: number; orderedIds: number[] }) => {
      await apiRequest("POST", "/api/books/reorder", { shelfId, orderedIds });
    },
    onMutate: async ({ shelfId, orderedIds }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/shelves"] });
      const previous = queryClient.getQueryData<ShelfWithBooks[]>(["/api/shelves"]);
      queryClient.setQueryData<ShelfWithBooks[]>(["/api/shelves"], (old) => {
        if (!old) return old;
        return old.map((shelf) => {
          if (shelf.id !== shelfId) return shelf;
          const bookMap = new Map(shelf.books.map((b) => [b.id, b]));
          const reordered = orderedIds.map((id) => bookMap.get(id)).filter(Boolean);
          return { ...shelf, books: reordered as typeof shelf.books };
        });
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/shelves"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shelves"] });
    },
  });

  const handleReorder = (newOrder: ShelfWithBooks[]) => {
    setOrderedShelves(newOrder);
    reorderMutation.mutate(newOrder.map((s) => s.id));
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#1D1D1F] pb-24 overflow-x-hidden font-sans relative">
      <div className="flex justify-between items-center px-8 pt-4 pb-2 text-[15px] font-semibold text-black max-w-[430px] mx-auto md:hidden">
        <span>9:41</span>
        <div className="w-[125px] h-[37px] bg-black rounded-[18px] absolute left-1/2 transform -translate-x-1/2 top-2 z-50">
           <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#111] shadow-[inset_0_0_3px_rgba(255,255,255,0.2)]"></div>
        </div>
        <div className="flex items-center gap-1.5">
          <Signal size={16} className="fill-current" strokeWidth={0} />
          <Wifi size={16} strokeWidth={2.5} />
          <Battery size={20} strokeWidth={2} />
        </div>
      </div>
      <header className="pt-10 md:pt-16 pb-10 px-8 text-center max-w-[1200px] mx-auto relative z-10">
        <h1 className="md:text-[7rem] lg:text-[8rem] tracking-[-0.03em] font-serif text-[#1D1D1F] font-bold uppercase mb-2 text-[48px]">
          Bookboard
        </h1>
        <p className="text-[18px] md:text-[21px] tracking-[0.02em] text-[#1D1D1F]/60 font-normal font-serif italic -mt-1">
          Curated by Dreameryanyan
        </p>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            data-testid="button-new-shelf"
            onClick={() => setShowAddShelf(true)}
            className="flex items-center gap-2 bg-white/60 px-5 py-2 md:px-6 md:py-2.5 rounded-full border border-black/10 shadow-sm hover:bg-white/80 transition-colors"
          >
            <Plus size={16} strokeWidth={2} className="text-[#1D1D1F]" />
            <span className="text-[14px] md:text-[15px] font-medium text-[#1D1D1F]">New Shelf</span>
          </button>
          
          <button
            data-testid="button-add-book"
            onClick={() => setShowAddBook(true)}
            className="flex items-center gap-2 bg-white/60 px-5 py-2 md:px-6 md:py-2.5 rounded-full border border-black/10 shadow-sm hover:bg-white/80 transition-colors"
          >
            <BookOpen size={16} strokeWidth={2} className="text-[#1D1D1F]" />
            <span className="text-[14px] md:text-[15px] font-medium text-[#1D1D1F]">Add Book</span>
          </button>
        </div>
      </header>
      <div className="mt-4 max-w-[1200px] mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-black/10 border-t-black/60 rounded-full animate-spin" />
          </div>
        ) : orderedShelves.length === 0 ? (
          <div data-testid="text-empty-state" className="text-center py-20 text-[#8E8E93]">
            <p className="text-lg font-medium mb-2">No shelves yet</p>
            <p className="text-sm">Tap "New Shelf" to create your first book shelf</p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={orderedShelves}
            onReorder={handleReorder}
            className="space-y-12 md:space-y-16 list-none p-0 m-0"
          >
            {orderedShelves.map((shelf) => (
              <ReorderableShelf
                key={shelf.id}
                shelf={shelf}
                onDeleteShelf={() => deleteShelfMutation.mutate(shelf.id)}
                onDeleteBook={(bookId) => deleteBookMutation.mutate(bookId)}
                onEditShelf={() => setEditingShelf(shelf)}
                onBookClick={(bookId) => {
                  const book = shelf.books.find(b => b.id === bookId);
                  if (book) setSelectedBook(book);
                }}
                onReorderBooks={(orderedIds) => reorderBooksMutation.mutate({ shelfId: shelf.id, orderedIds })}
              />
            ))}
          </Reorder.Group>
        )}
      </div>
      {showAddShelf && (
        <AddShelfModal onClose={() => setShowAddShelf(false)} />
      )}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
      {editingShelf && (
        <EditShelfModal
          shelf={editingShelf}
          onClose={() => setEditingShelf(null)}
          onDelete={() => deleteShelfMutation.mutate(editingShelf.id)}
        />
      )}
      {showAddBook && (
        <AddBookModal
          shelves={orderedShelves}
          onClose={() => setShowAddBook(false)}
        />
      )}
    </div>
  );
}
