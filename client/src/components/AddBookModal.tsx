import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { X, Loader2, ImageOff } from "lucide-react";
import type { Shelf } from "@shared/schema";

interface AddBookModalProps {
  shelves: Shelf[];
  onClose: () => void;
}

export default function AddBookModal({ shelves, onClose }: AddBookModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [shelfId, setShelfId] = useState(shelves[0]?.id || 0);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverSearched, setCoverSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    const trimmed = title.trim();
    if (!trimmed || trimmed.length < 3) {
      setCoverUrl(null);
      setCoverLoading(false);
      setCoverSearched(false);
      return;
    }
    setCoverLoading(true);
    setCoverSearched(true);
    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      fetch(`/api/books/cover-search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((res) => {
          const ct = res.headers.get("content-type") || "";
          if (!ct.includes("application/json")) {
            throw new Error("Not JSON");
          }
          return res.json();
        })
        .then((data) => {
          if (!controller.signal.aborted) {
            setCoverUrl(data.coverUrl || null);
            setCoverLoading(false);
          }
        })
        .catch((err) => {
          if (!controller.signal.aborted) {
            setCoverUrl(null);
            setCoverLoading(false);
          }
        });
    }, 800);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [title]);

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/books", {
        title,
        author: author || null,
        shelfId,
        coverImage: coverUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shelves"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-[20px] md:rounded-[20px] w-full max-w-[430px] md:max-w-[480px] p-6 pb-10 md:pb-6 animate-in slide-in-from-bottom md:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Add Book</h2>
          <button data-testid="button-close-book-modal" onClick={onClose} className="p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-5 items-stretch">
          <div data-testid="cover-preview-area" className="shrink-0 flex flex-col">
            <div className="w-[130px] flex-1 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
              {coverLoading ? (
                <Loader2 data-testid="cover-loading" className="w-7 h-7 text-gray-400 animate-spin" />
              ) : coverUrl ? (
                <img
                  data-testid="img-cover-preview"
                  src={coverUrl}
                  alt="Book cover"
                  className="w-full h-full object-cover"
                />
              ) : coverSearched ? (
                <div data-testid="text-no-cover" className="flex flex-col items-center text-gray-400">
                  <ImageOff className="w-6 h-6 mb-1" />
                  <span className="text-[11px]">Not found</span>
                </div>
              ) : (
                <div className="text-gray-300 text-[11px] text-center px-1">Cover preview</div>
              )}
            </div>
            {coverUrl && (
              <button
                data-testid="button-clear-cover"
                type="button"
                onClick={() => {
                  setCoverUrl(null);
                  setCoverSearched(false);
                }}
                className="text-[12px] text-gray-500 hover:text-gray-700 underline mt-1.5 block mx-auto"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
            <input
              data-testid="input-book-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Book title"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-[15px] mb-3 focus:outline-none focus:ring-2 focus:ring-black/20"
              autoFocus
            />

            <label className="block text-sm font-medium text-gray-600 mb-1">Author</label>
            <input
              data-testid="input-book-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name (optional)"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-[15px] mb-3 focus:outline-none focus:ring-2 focus:ring-black/20"
            />

            <label className="block text-sm font-medium text-gray-600 mb-1">Shelf</label>
            <select
              data-testid="select-book-shelf"
              value={shelfId}
              onChange={(e) => setShelfId(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/20 bg-white mb-0"
            >
              {shelves.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          data-testid="button-create-book"
          onClick={() => createMutation.mutate()}
          disabled={!title.trim() || !shelfId || createMutation.isPending}
          className="w-full bg-black text-white py-3.5 rounded-full text-[16px] font-semibold disabled:opacity-40 transition-opacity mt-5"
        >
          {createMutation.isPending ? "Adding..." : "Add Book"}
        </button>
      </div>
    </div>
  );
}
