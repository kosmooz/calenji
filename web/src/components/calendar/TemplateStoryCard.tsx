"use client";

import { Instagram, Facebook, Trash2 } from "lucide-react";

interface StoryTemplate {
  id: string;
  name: string | null;
  socialAccountIds: string[];
  media: { localUrl: string; type: string }[];
}

interface TemplateStoryCardProps {
  template: StoryTemplate;
  onClick: (template: StoryTemplate) => void;
  onDelete: (id: string) => void;
  socialAccounts: { id: string; platform: string }[];
}

export default function TemplateStoryCard({ template, onClick, onDelete, socialAccounts }: TemplateStoryCardProps) {
  const mediaItem = template.media?.[0];
  const platforms = [
    ...new Set(
      template.socialAccountIds
        .map((id) => socialAccounts.find((a) => a.id === id)?.platform)
        .filter(Boolean),
    ),
  ];

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "template",
        id: template.id,
        mediaUrl: mediaItem?.localUrl,
        socialAccountIds: template.socialAccountIds,
      }),
    );
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(template)}
      className="relative aspect-[9/16] rounded-lg overflow-hidden border border-[#e8e5e0] bg-[#f7f6f3] cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
    >
      {/* Media preview */}
      {mediaItem && (
        mediaItem.type === "VIDEO" ? (
          <video
            src={mediaItem.localUrl}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
        ) : (
          <img
            src={mediaItem.localUrl}
            className="w-full h-full object-cover"
            alt=""
          />
        )
      )}

      {/* Platform icons overlay */}
      <div className="absolute top-1 left-1 flex gap-0.5">
        {platforms.map((p) => (
          <div
            key={p}
            className="w-4 h-4 rounded-full bg-black/50 flex items-center justify-center"
          >
            {p === "INSTAGRAM" ? (
              <Instagram className="h-2.5 w-2.5 text-white" />
            ) : (
              <Facebook className="h-2.5 w-2.5 text-white fill-white" />
            )}
          </div>
        ))}
      </div>

      {/* Delete button on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(template.id);
        }}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
        title="Supprimer le modèle"
      >
        <Trash2 className="h-2.5 w-2.5 text-white" />
      </button>

      {/* Name overlay */}
      {template.name && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5">
          <span className="text-[9px] text-white truncate block">{template.name}</span>
        </div>
      )}

      {/* Hover hint */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
        <span className="text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-1.5 py-0.5 rounded">
          Glisser
        </span>
      </div>
    </div>
  );
}
