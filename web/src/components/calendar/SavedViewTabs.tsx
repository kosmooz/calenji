"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface SavedView {
  id: string;
  name: string;
  socialAccountIds: string[];
  position: number;
}

interface SavedViewTabsProps {
  views: SavedView[];
  activeViewId: string | null;
  onSelectView: (view: SavedView | null) => void;
  onCreateView: () => void;
  onEditView: (view: SavedView) => void;
  onDeleteView: (viewId: string) => void;
}

export default function SavedViewTabs({
  views,
  activeViewId,
  onSelectView,
  onCreateView,
  onEditView,
  onDeleteView,
}: SavedViewTabsProps) {
  const [menuViewId, setMenuViewId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuViewId(null);
      }
    };
    if (menuViewId) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuViewId]);

  const openMenu = (e: React.MouseEvent, viewId: string) => {
    e.stopPropagation();
    if (menuViewId === viewId) {
      setMenuViewId(null);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom + 4 });
    setMenuViewId(viewId);
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
      {/* "Tous" tab */}
      <button
        onClick={() => onSelectView(null)}
        className={`flex-shrink-0 h-7 px-3 rounded-md text-xs font-medium transition-colors ${
          activeViewId === null
            ? "bg-[#37352f] text-white"
            : "bg-white border border-[#e8e5e0] text-[#37352f] hover:bg-[#f7f6f3]"
        }`}
      >
        Tous
      </button>

      {/* Saved view tabs */}
      {views.map((view) => (
        <div key={view.id} className="relative flex-shrink-0 group">
          <button
            onClick={() => onSelectView(view)}
            className={`h-7 px-3 pr-7 rounded-md text-xs font-medium transition-colors ${
              activeViewId === view.id
                ? "bg-[#37352f] text-white"
                : "bg-white border border-[#e8e5e0] text-[#37352f] hover:bg-[#f7f6f3]"
            }`}
          >
            {view.name}
          </button>
          <button
            onClick={(e) => openMenu(e, view.id)}
            className={`absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity ${
              activeViewId === view.id
                ? "text-white/70 hover:text-white"
                : "text-[#9b9a97] hover:text-[#37352f]"
            }`}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {/* Add button */}
      <button
        onClick={onCreateView}
        className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-md border border-dashed border-[#d3d1cb] text-[#9b9a97] hover:border-[#37352f] hover:text-[#37352f] transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      {/* Fixed context menu (outside overflow container) */}
      {menuViewId && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white rounded-lg border border-[#e8e5e0] shadow-lg py-1 w-36"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          <button
            onClick={() => {
              const view = views.find((v) => v.id === menuViewId);
              setMenuViewId(null);
              if (view) onEditView(view);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#37352f] hover:bg-[#f7f6f3] transition-colors"
          >
            <Pencil className="h-3.5 w-3.5 text-[#9b9a97]" />
            Modifier
          </button>
          <button
            onClick={() => {
              const id = menuViewId;
              setMenuViewId(null);
              onDeleteView(id);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}
