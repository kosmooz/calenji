"use client";

import { useState } from "react";
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

interface CalendarMonthViewProps {
  date: Date;
  items: CalendarItem[];
  onReschedule: (type: string, id: string, date: Date) => void;
  onItemClick?: (type: string, id: string) => void;
  onCellClick?: (date: Date, event: React.MouseEvent) => void;
}

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function CalendarMonthView({
  date,
  items,
  onReschedule,
  onItemClick,
  onCellClick,
}: CalendarMonthViewProps) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // First day of month (Monday = 0)
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build grid of days (6 weeks max)
  const days: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const getItemsForDay = (day: number) => {
    const dayStart = new Date(year, month, day);
    const dayEnd = new Date(year, month, day + 1);
    return items.filter((item) => {
      const itemDate = new Date(item.scheduledAt || item.publishedAt || "");
      return itemDate >= dayStart && itemDate < dayEnd;
    });
  };

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;
    const { type, id } = JSON.parse(data);
    const target = new Date(year, month, day, 9, 0);
    onReschedule(type, id, target);
  };

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-[#e8e5e0]">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-[#9b9a97] uppercase py-1.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => (
          <div
            key={i}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => day && handleDrop(e, day)}
            onClick={(e) => {
              if (!day) return;
              const target = e.target as HTMLElement;
              if (target.closest("[data-calendar-item]")) return;
              onCellClick?.(new Date(year, month, day, 9, 0), e);
            }}
            className={`min-h-[80px] border-b border-r border-[#e8e5e0] p-1 cursor-pointer ${
              day ? "bg-white hover:bg-[#fafaf9]" : "bg-[#fafaf9]"
            } ${i % 7 === 0 ? "border-l" : ""}`}
          >
            {day && (
              <>
                <div
                  className={`text-[11px] mb-0.5 ${
                    isToday(day)
                      ? "w-5 h-5 rounded-full bg-[#37352f] text-white flex items-center justify-center"
                      : "text-[#73726e]"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-0.5">
                  {getItemsForDay(day)
                    .slice(0, expandedDays.has(day) ? undefined : 3)
                    .map((item) => (
                      <CalendarItemChip
                        key={`${item.type}-${item.id}`}
                        item={item}
                        onClick={onItemClick}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify({
                              type: item.type,
                              id: item.id,
                            }),
                          );
                        }}
                      />
                    ))}
                  {getItemsForDay(day).length > 3 && !expandedDays.has(day) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedDays((s) => new Set(s).add(day)); }}
                      className="text-[9px] text-[#9b9a97] px-1 hover:text-[#37352f] transition-colors"
                    >
                      +{getItemsForDay(day).length - 3} de plus
                    </button>
                  )}
                  {expandedDays.has(day) && getItemsForDay(day).length > 3 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedDays((s) => { const n = new Set(s); n.delete(day); return n; }); }}
                      className="text-[9px] text-[#9b9a97] px-1 hover:text-[#37352f] transition-colors"
                    >
                      Réduire
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
