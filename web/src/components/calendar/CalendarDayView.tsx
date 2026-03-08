"use client";

import CalendarItemChip from "./CalendarItemChip";

interface CalendarItem {
  id: string;
  type: "post" | "story";
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  caption: string | null;
  thumbnailUrl: string | null;
  platforms: string[];
}

interface CalendarDayViewProps {
  date: Date;
  items: CalendarItem[];
  onReschedule: (type: string, id: string, date: Date) => void;
  onItemClick?: (type: string, id: string) => void;
  onCellClick?: (date: Date, event: React.MouseEvent) => void;
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5); // 5h - 22h

export default function CalendarDayView({
  date,
  items,
  onReschedule,
  onItemClick,
  onCellClick,
}: CalendarDayViewProps) {
  const getItemsForHour = (hour: number) => {
    return items.filter((item) => {
      const d = new Date(item.scheduledAt || item.publishedAt || "");
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate() &&
        d.getHours() === hour
      );
    });
  };

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;
    const { type, id } = JSON.parse(data);
    const target = new Date(date);
    target.setHours(hour, 0, 0, 0);
    onReschedule(type, id, target);
  };

  return (
    <div className="overflow-auto max-h-[600px]">
      <div className="text-center py-2 border-b border-[#e8e5e0]">
        <div className="text-sm font-medium text-[#37352f]">
          {date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
      </div>

      {HOURS.map((hour) => (
        <div
          key={hour}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, hour)}
          className="flex border-b border-[#e8e5e0] min-h-[48px]"
        >
          <div className="w-14 text-[10px] text-[#9b9a97] text-right pr-2 pt-1 flex-shrink-0">
            {hour}:00
          </div>
          <div
            className="flex-1 p-1 space-y-0.5 cursor-pointer hover:bg-[#fafaf9]"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest("[data-calendar-item]")) return;
              const d = new Date(date);
              d.setHours(hour, 0, 0, 0);
              onCellClick?.(d, e);
            }}
          >
            {getItemsForHour(hour).map((item) => (
              <CalendarItemChip
                key={`${item.type}-${item.id}`}
                item={item}
                onClick={onItemClick}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({ type: item.type, id: item.id }),
                  );
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
