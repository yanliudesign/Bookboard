import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Book } from "@shared/schema";

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
}

export default function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-t-[24px] md:rounded-[24px] w-full max-w-[430px] md:max-w-[520px] max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
        >
          <div className="relative">
            <div className="w-full aspect-[3/2] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-[24px] md:rounded-t-[24px] overflow-hidden">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="h-full object-contain"
                  data-testid={`img-book-detail-${book.id}`}
                />
              ) : (
                <div className="text-gray-400 text-lg font-serif">{book.title}</div>
              )}
            </div>

            <button
              data-testid="button-close-book-detail"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          <div className="px-6 pt-5 pb-8">
            <h2
              data-testid={`text-book-detail-title-${book.id}`}
              className="text-[1.5rem] md:text-[1.75rem] font-serif font-bold tracking-[-0.02em] text-[#111] leading-tight"
            >
              {book.title}
            </h2>

            {book.author && (
              <p
                data-testid={`text-book-detail-author-${book.id}`}
                className="text-[0.95rem] text-[#666] mt-1.5 font-medium"
              >
                by {book.author}
              </p>
            )}

            {book.description && (
              <div className="mt-5">
                <p
                  data-testid={`text-book-detail-desc-${book.id}`}
                  className="text-[0.9rem] md:text-[0.95rem] leading-[1.7] text-[#444]"
                >
                  {book.description}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
