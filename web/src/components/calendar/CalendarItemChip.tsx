"use client";

interface CalendarItemChipProps {
  item: {
    id: string;
    type: "post" | "story";
    status: string;
    scheduledAt: string | null;
    caption: string | null;
    thumbnailUrl: string | null;
    platforms: string[];
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

export default function CalendarItemChip({
  item,
  onDragStart,
  onClick,
}: CalendarItemChipProps) {
  const time = item.scheduledAt
    ? new Date(item.scheduledAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const colorClass =
    STATUS_COLORS[item.status] || STATUS_COLORS.DRAFT;

  const platformIcons = item.platforms
    .map((p) => (p === "INSTAGRAM" ? "📷" : "📘"))
    .join("");

  const handleClick = () => {
    onClick?.(item.type, item.id);
  };

  return (
    <div
      data-calendar-item
      draggable={["DRAFT", "SCHEDULED"].includes(item.status)}
      onDragStart={onDragStart}
      onClick={handleClick}
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] cursor-pointer truncate ${colorClass} hover:shadow-sm transition-shadow`}
      title={item.caption || (item.type === "story" ? "Story" : "Publication")}
    >
      <span>{platformIcons}</span>
      {time && <span className="font-medium">{time}</span>}
      {item.thumbnailUrl && (
        <img
          src={item.thumbnailUrl}
          className="w-3.5 h-3.5 rounded-sm object-cover flex-shrink-0"
        />
      )}
      <span className="truncate">
        {item.type === "story"
          ? "Story"
          : item.caption?.slice(0, 20) || "Sans texte"}
      </span>
    </div>
  );
}
