import { useRef, useState, useCallback } from "react";
import { BookOpen, GripVertical, Pencil, Trash2 } from "lucide-react";

interface Book {
  id: number;
  title: string;
  image: string;
}

interface BookShelfProps {
  shelfId: number;
  title: string;
  count: number;
  books: Book[];
  overlayColor: string;
  overlayBorder: string;
  onDeleteShelf?: () => void;
  onDeleteBook?: (bookId: number) => void;
  onEditShelf?: () => void;
  onBookClick?: (bookId: number) => void;
  onReorderBooks?: (orderedIds: number[]) => void;
  onDragHandlePointerDown?: (e: React.PointerEvent) => void;
}

export default function BookShelf({ shelfId, title, count, books, overlayColor, overlayBorder, onDeleteShelf, onDeleteBook, onEditShelf, onBookClick, onReorderBooks, onDragHandlePointerDown }: BookShelfProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [dragBookId, setDragBookId] = useState<number | null>(null);
  const [dragOverBookId, setDragOverBookId] = useState<number | null>(null);
  const didDragRef = useRef(false);

  const handleDragStart = useCallback((e: React.DragEvent, bookId: number) => {
    setDragBookId(bookId);
    didDragRef.current = false;
    e.dataTransfer.effectAllowed = "move";
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.5";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, bookId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (bookId !== dragBookId) {
      setDragOverBookId(bookId);
      didDragRef.current = true;
    }
  }, [dragBookId]);

  const handleDragLeave = useCallback(() => {
    setDragOverBookId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetBookId: number) => {
    e.preventDefault();
    if (dragBookId === null || dragBookId === targetBookId) return;

    const oldIndex = books.findIndex(b => b.id === dragBookId);
    const newIndex = books.findIndex(b => b.id === targetBookId);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...books];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);
    onReorderBooks?.(newOrder.map(b => b.id));

    setDragBookId(null);
    setDragOverBookId(null);
  }, [dragBookId, books, onReorderBooks]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
    setDragBookId(null);
    setDragOverBookId(null);
  }, []);

  const handleBookClick = useCallback((bookId: number) => {
    if (!didDragRef.current) {
      onBookClick?.(bookId);
    }
    didDragRef.current = false;
  }, [onBookClick]);

  return (
    <div className="relative w-full mb-10" data-testid={`shelf-${shelfId}`}>
      <div className="flex items-end justify-between pl-6 pr-4 md:pl-8 md:pr-5 mb-5">
        <h2 className="text-[1.35rem] md:text-[1.5rem] font-serif font-normal tracking-[-0.02em] text-[#1D1D1F]">{title}</h2>
        <div className="flex items-center text-[#8E8E93]">
          <span data-testid={`text-book-count-${shelfId}`} className="text-[0.95rem] text-[#A1A1A5]">{count} {count === 1 ? 'book' : 'books'}</span>
          {onEditShelf && (
            <button
              data-testid={`button-edit-shelf-${shelfId}`}
              onClick={onEditShelf}
              className="ml-2 text-[#C5C5C7] hover:text-[#888] transition-colors"
            >
              <Pencil size={15} strokeWidth={2} />
            </button>
          )}
          {onDragHandlePointerDown && (
            <div
              data-testid={`drag-handle-shelf-${shelfId}`}
              className="cursor-grab active:cursor-grabbing touch-none text-[#C5C5C7] hover:text-[#888] transition-colors ml-1"
              onPointerDown={onDragHandlePointerDown}
            >
              <GripVertical size={18} strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto pl-[52px] md:pl-[60px] pr-6 md:pr-8 pb-2 pt-2 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.length === 0 ? (
            <div className="flex gap-[18px] md:gap-[24px]">
              <div className="flex-shrink-0 w-[122px] md:w-[150px] lg:w-[170px]">
                <div className="relative rounded-[2px] shadow-[6px_10px_20px_rgba(0,0,0,0.15),1px_2px_5px_rgba(0,0,0,0.08)] overflow-hidden aspect-[0.7] bg-gray-100 flex items-center justify-center">
                  <BookOpen size={28} className="text-gray-300" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-[18px] md:gap-[24px]">
              {books.map((book) => (
                <div
                  key={book.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, book.id)}
                  onDragOver={(e) => handleDragOver(e, book.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, book.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleBookClick(book.id)}
                  className={`flex-shrink-0 w-[122px] md:w-[150px] lg:w-[170px] group relative cursor-pointer transition-transform duration-150 ${
                    dragOverBookId === book.id ? "scale-95" : ""
                  }`}
                  data-testid={`card-book-${book.id}`}
                >
                  <div className="relative rounded-[2px] shadow-[6px_10px_20px_rgba(0,0,0,0.15),1px_2px_5px_rgba(0,0,0,0.08)] overflow-hidden aspect-[0.7]">
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-r from-black/30 via-white/20 to-transparent z-10 mix-blend-overlay" />
                    <div className="absolute inset-y-0 left-[3px] w-[1px] bg-black/15 z-10" />
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40 z-10" />
                    <div className="absolute inset-x-0 bottom-0 h-[1px] bg-black/30 z-10" />
                    
                    {book.image ? (
                      <img 
                        src={book.image} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center p-2">
                        <span className="text-[10px] md:text-[12px] text-gray-500 text-center font-medium leading-tight">{book.title}</span>
                      </div>
                    )}

                    {onDeleteBook && (
                      <button
                        data-testid={`button-delete-book-${book.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBook(book.id);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 md:w-6 md:h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      >
                        <Trash2 size={10} className="text-white md:w-3 md:h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex-shrink-0 w-[40px]" />
            </div>
          )}
        </div>

        <div 
          className="absolute left-[18px] right-[18px] md:left-[24px] md:right-[24px] bottom-0 h-[72px] md:h-[85px] lg:h-[95px] rounded-[10px] md:rounded-[12px] shadow-[0_12px_24px_rgba(0,0,0,0.15)] z-20 flex items-center justify-between px-[16px] md:px-[20px] pointer-events-none overflow-hidden"
          style={{ 
            backgroundColor: overlayColor,
            border: `1px solid ${overlayBorder}`,
          }}
        >
          <div className="absolute inset-x-0 top-0 h-[2px] bg-white/40 rounded-t-[10px]"></div>
          <div className="absolute inset-x-0 top-0 h-[1px] bg-white/80 rounded-t-[10px]"></div>
          <div className="absolute inset-x-0 top-[2px] h-[1px] bg-black/10"></div>
          
          <div className="w-[14px] h-[14px] md:w-[16px] md:h-[16px] rounded-full bg-gradient-to-br from-[#E6E6E6] to-[#A3A3A3] shadow-[0_3px_5px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.3)] relative flex items-center justify-center border border-[#777]/40 z-30 ml-[2px]">
            <div className="w-[7px] h-[1.5px] bg-[#555] transform -rotate-45 shadow-[inset_0_1px_0_rgba(0,0,0,0.4)] rounded-[1px]" />
          </div>

          <div className="w-[14px] h-[14px] md:w-[16px] md:h-[16px] rounded-full bg-gradient-to-br from-[#E6E6E6] to-[#A3A3A3] shadow-[0_3px_5px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.3)] relative flex items-center justify-center border border-[#777]/40 z-30 mr-[2px]">
            <div className="w-[7px] h-[1.5px] bg-[#555] transform rotate-[15deg] shadow-[inset_0_1px_0_rgba(0,0,0,0.4)] rounded-[1px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
