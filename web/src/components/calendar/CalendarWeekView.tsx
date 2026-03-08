"use client";

import CalendarItemChip from "./CalendarItemChip";

interface CalendarItem {
  id: string;
  type: "post" | "story";
  contentType: string | null;
  mediaType: string | null;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  caption: string | null;
  thumbnailUrl: string | null;
  platforms: string[];
  platformAccounts?: { platform: string; accountName: string; accountAvatar: string | null }[];
}

interface CalendarWeekViewProps {
  date: Date;
  items: CalendarItem[];
  onReschedule: (type: string, id: string, date: Date) => void;
  onItemClick?: (type: string, id: string) => void;
  onCellClick?: (date: Date, event: React.MouseEvent) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6h - 21h

export default function CalendarWeekView({
  date,
  items,
  onReschedule,
  onItemClick,
  onCellClick,
}: CalendarWeekViewProps) {
  // Get Monday of the week
  const dayOfWeek = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - dayOfWeek);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const today = new Date();

  const getItemsForDayHour = (day: Date, hour: number) => {
    return items.filter((item) => {
      const d = new Date(item.scheduledAt || item.publishedAt || "");
      return (
        d.getFullYear() === day.getFullYear() &&
        d.getMonth() === day.getMonth() &&
        d.getDate() === day.getDate() &&
        d.getHours() === hour
      );
    });
  };

  const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;
    const { type, id } = JSON.parse(data);
    const target = new Date(day);
    target.setHours(hour, 0, 0, 0);
    onReschedule(type, id, target);
  };

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  return (
    <div className="overflow-auto max-h-[600px]">
      <div className="grid grid-cols-[50px_repeat(7,1fr)] min-w-[700px]">
        {/* Header */}
        <div className="border-b border-[#e8e5e0]" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`text-center py-1.5 border-b border-l border-[#e8e5e0] ${
              isToday(day) ? "bg-blue-50" : ""
            }`}
          >
            <div className="text-[10px] text-[#9b9a97] uppercase">
              {day.toLocaleDateString("fr-FR", { weekday: "short" })}
            </div>
            <div
              className={`text-sm font-medium ${
                isToday(day) ? "text-blue-600" : "text-[#37352f]"
              }`}
            >
              {day.getDate()}
            </div>
          </div>
        ))}

        {/* Hour rows */}
        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="text-[10px] text-[#9b9a97] text-right pr-2 pt-1 border-b border-[#e8e5e0]">
              {hour}:00
            </div>
            {days.map((day) => (
              <div
                key={`${day.toISOString()}-${hour}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, day, hour)}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("[data-calendar-item]")) return;
                  const d = new Date(day);
                  d.setHours(hour, 0, 0, 0);
                  onCellClick?.(d, e);
                }}
                className="min-h-[40px] border-b border-l border-[#e8e5e0] p-0.5 cursor-pointer hover:bg-[#fafaf9]"
              >
                {getItemsForDayHour(day, hour).map((item) => (
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
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
