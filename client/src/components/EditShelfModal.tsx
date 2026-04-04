import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { X, Trash2 } from "lucide-react";
import type { Shelf } from "@shared/schema";

const SHELF_COLORS = [
  { name: "Turquoise Surf", overlayColor: "rgba(6, 174, 213, 0.45)", overlayBorder: "rgba(6, 174, 213, 0.75)" },
  { name: "Cerulean", overlayColor: "rgba(8, 103, 136, 0.45)", overlayBorder: "rgba(8, 103, 136, 0.75)" },
  { name: "Bright Amber", overlayColor: "rgba(240, 200, 8, 0.45)", overlayBorder: "rgba(240, 200, 8, 0.75)" },
  { name: "Papaya Whip", overlayColor: "rgba(255, 241, 208, 0.45)", overlayBorder: "rgba(255, 241, 208, 0.75)" },
  { name: "Primary Scarlet", overlayColor: "rgba(221, 28, 26, 0.45)", overlayBorder: "rgba(221, 28, 26, 0.75)" },
  { name: "Dark Teal", overlayColor: "rgba(0, 56, 68, 0.45)", overlayBorder: "rgba(0, 56, 68, 0.75)" },
  { name: "Stormy Teal", overlayColor: "rgba(0, 108, 103, 0.45)", overlayBorder: "rgba(0, 108, 103, 0.75)" },
  { name: "Pink Mist", overlayColor: "rgba(241, 148, 180, 0.45)", overlayBorder: "rgba(241, 148, 180, 0.75)" },
  { name: "Forest Green", overlayColor: "rgba(77, 139, 49, 0.45)", overlayBorder: "rgba(77, 139, 49, 0.75)" },
  { name: "Dusty Grape", overlayColor: "rgba(107, 92, 165, 0.45)", overlayBorder: "rgba(107, 92, 165, 0.75)" },
  { name: "Pale Sky", overlayColor: "rgba(199, 219, 230, 0.45)", overlayBorder: "rgba(199, 219, 230, 0.75)" },
  { name: "Strong Cyan", overlayColor: "rgba(6, 188, 193, 0.45)", overlayBorder: "rgba(6, 188, 193, 0.75)" },
];

interface EditShelfModalProps {
  shelf: Shelf;
  onClose: () => void;
  onDelete: () => void;
}

export default function EditShelfModal({ shelf, onClose, onDelete }: EditShelfModalProps) {
  const [name, setName] = useState(shelf.name);
  const currentColorIndex = SHELF_COLORS.findIndex(c => c.overlayColor === shelf.overlayColor);
  const [selectedColor, setSelectedColor] = useState(currentColorIndex >= 0 ? currentColorIndex : 0);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const color = SHELF_COLORS[selectedColor];
      await apiRequest("PATCH", `/api/shelves/${shelf.id}`, {
        name,
        overlayColor: color.overlayColor,
        overlayBorder: color.overlayBorder,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shelves"] });
      onClose();
    },
  });

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-[20px] md:rounded-[20px] w-full max-w-[430px] md:max-w-[480px] p-6 pb-10 md:pb-6 animate-in slide-in-from-bottom md:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Edit Shelf</h2>
          <button data-testid="button-close-edit-modal" onClick={onClose} className="p-1">
            <X size={20} />
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-600 mb-1.5">Shelf Name</label>
        <input
          data-testid="input-edit-shelf-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Shelf name"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[16px] mb-5 focus:outline-none focus:ring-2 focus:ring-black/20"
          autoFocus
        />

        <label className="block text-sm font-medium text-gray-600 mb-2">Color</label>
        <div className="flex flex-wrap gap-3 mb-6">
          {SHELF_COLORS.map((color, i) => (
            <button
              key={color.name}
              data-testid={`button-edit-color-${color.name.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => setSelectedColor(i)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                selectedColor === i ? "border-black scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: color.overlayColor }}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            data-testid="button-delete-shelf"
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
          <button
            data-testid="button-save-shelf"
            onClick={() => updateMutation.mutate()}
            disabled={!name.trim() || updateMutation.isPending}
            className="flex-1 bg-black text-white py-3.5 rounded-full text-[16px] font-semibold disabled:opacity-40 transition-opacity"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
