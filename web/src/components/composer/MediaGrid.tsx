"use client";

import { X, GripVertical } from "lucide-react";

interface MediaGridProps {
  urls: string[];
  onRemove: (index: number) => void;
  onReorder: (urls: string[]) => void;
}

export default function MediaGrid({ urls, onRemove, onReorder }: MediaGridProps) {
  if (!urls.length) return null;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (dragIndex === dropIndex) return;
    const newUrls = [...urls];
    const [removed] = newUrls.splice(dragIndex, 1);
    newUrls.splice(dropIndex, 0, removed);
    onReorder(newUrls);
  };

  const isVideo = (url: string) => /\.(mp4|webm|mov)$/i.test(url);

  return (
    <div className="grid grid-cols-3 gap-2">
      {urls.map((url, i) => (
        <div
          key={`${url}-${i}`}
          draggable
          onDragStart={(e) => handleDragStart(e, i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, i)}
          className="relative aspect-square rounded-md overflow-hidden border border-[#e8e5e0] group cursor-move"
        >
          {isVideo(url) ? (
            <video
              src={url}
              className="w-full h-full object-cover"
              muted
            />
          ) : (
            <img
              src={url}
              alt={`Media ${i + 1}`}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(i); }}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-white drop-shadow" />
          </div>
        </div>
      ))}
    </div>
  );
}
