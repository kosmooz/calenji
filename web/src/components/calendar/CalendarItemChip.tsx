"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Instagram, Facebook, Image, Video, FileText } from "lucide-react";

interface CalendarItemChipProps {
  item: {
    id: string;
    type: "post" | "story";
    contentType: string | null;
    mediaType: string | null;
    status: string;
    scheduledAt: string | null;
    caption: string | null;
    thumbnailUrl: string | null;
    platforms: string[];
    platformAccounts?: { platform: string; accountName: string; accountAvatar: string | null }[];
  };
  onDragStart?: (e: React.DragEvent) => void;
  onClick?: (type: string, id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 border-gray-200 text-gray-600",
  SCHEDULED: "bg-blue-50 border-blue-200 text-blue-700",
  PUBLISHING: "bg-yellow-50 border-yellow-200 text-yellow-700",
  PUBLISHED: "bg-green-50 border-green-200 text-green-700",
  FAILED: "bg-red-50 border-red-200 text-red-700",
};

function PlatformTooltip({ platform, names, anchorRect }: { platform: string; names: string[]; anchorRect: DOMRect }) {
  if (!names.length) return null;

  const top = anchorRect.top - 4;
  const left = anchorRect.left + anchorRect.width / 2;

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ top, left, transform: "translate(-50%, -100%)" }}
    >
      <div className="bg-[#37352f] text-white text-[10px] px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
        {names.map((name, i) => (
          <div key={i} className="flex items-center gap-1.5 py-0.5">
            {platform === "INSTAGRAM" ? (
              <Instagram className="h-2.5 w-2.5 text-pink-300" />
            ) : (
              <Facebook className="h-2.5 w-2.5 text-blue-300 fill-blue-300" />
            )}
            <span>{name}</span>
          </div>
        ))}
      </div>
      <div className="w-2 h-2 bg-[#37352f] rotate-45 mx-auto -mt-1" />
    </div>,
    document.body,
  );
}

export default function CalendarItemChip({
  item,
  onDragStart,
  onClick,
}: CalendarItemChipProps) {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const time = item.scheduledAt
    ? new Date(item.scheduledAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const colorClass =
    STATUS_COLORS[item.status] || STATUS_COLORS.DRAFT;

  const handleClick = () => {
    onClick?.(item.type, item.id);
  };

  const accountsByPlatform: Record<string, string[]> = {};
  (item.platformAccounts || []).forEach((pa) => {
    if (!accountsByPlatform[pa.platform]) accountsByPlatform[pa.platform] = [];
    accountsByPlatform[pa.platform].push(pa.accountName);
  });

  // Deduplicate accounts by name for avatar display
  const uniqueAccounts = (item.platformAccounts || []).filter(
    (pa, i, arr) => arr.findIndex((a) => a.accountName === pa.accountName) === i
  );

  const handleMouseEnter = (p: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setAnchorRect(rect);
    setHoveredPlatform(p);
  };

  const contentTypeLabel: Record<string, string> = {
    POST: "Publication",
    REEL: "Reel",
    STORY: "Story",
  };

  const typeLabel = item.contentType
    ? contentTypeLabel[item.contentType] || item.contentType
    : item.type === "story" ? "Story" : "Publication";

  const MediaIcon = item.mediaType === "VIDEO" ? Video : item.mediaType === "IMAGE" ? Image : null;

  return (
    <div
      data-calendar-item
      draggable={["DRAFT", "SCHEDULED"].includes(item.status)}
      onDragStart={onDragStart}
      onClick={handleClick}
      className={`flex flex-col gap-0.5 px-1.5 py-1 rounded border text-[10px] cursor-pointer ${colorClass} hover:shadow-sm transition-shadow`}
    >
      {/* Line 1: account avatars + time */}
      <div className="flex items-center gap-1">
        <span className="flex items-center -space-x-1 flex-shrink-0">
          {uniqueAccounts.map((pa) => (
            <span
              key={pa.accountName}
              className="flex items-center"
              onMouseEnter={(e) => handleMouseEnter(pa.platform, e)}
              onMouseLeave={() => { setHoveredPlatform(null); setAnchorRect(null); }}
            >
              {pa.accountAvatar ? (
                <img
                  src={pa.accountAvatar}
                  alt={pa.accountName}
                  className="h-4 w-4 rounded-full object-cover ring-1 ring-white"
                />
              ) : pa.platform === "INSTAGRAM" ? (
                <Instagram className="h-3 w-3 text-pink-500" />
              ) : (
                <Facebook className="h-3 w-3 text-blue-600 fill-blue-600" />
              )}
            </span>
          ))}
        </span>
        {time && <span className="font-medium">{time}</span>}
      </div>

      {/* Line 2: media type icon + content type label */}
      <div className="flex items-center gap-1 text-[9px] opacity-70">
        {MediaIcon && <MediaIcon className="h-2.5 w-2.5 flex-shrink-0" />}
        <span className="truncate">{typeLabel}{item.mediaType === "VIDEO" ? " · Vidéo" : item.mediaType === "IMAGE" ? " · Image" : ""}</span>
      </div>

      {hoveredPlatform && anchorRect && accountsByPlatform[hoveredPlatform]?.length > 0 && (
        <PlatformTooltip
          platform={hoveredPlatform}
          names={accountsByPlatform[hoveredPlatform]}
          anchorRect={anchorRect}
        />
      )}
    </div>
  );
}
