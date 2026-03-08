"use client";

export type CalendarViewMode = "month" | "week" | "day";

interface CalendarViewToggleProps {
  value: CalendarViewMode;
  onChange: (mode: CalendarViewMode) => void;
}

const MODES: { value: CalendarViewMode; label: string }[] = [
  { value: "month", label: "Mois" },
  { value: "week", label: "Semaine" },
  { value: "day", label: "Jour" },
];

export default function CalendarViewToggle({
  value,
  onChange,
}: CalendarViewToggleProps) {
  return (
    <div className="flex rounded-md border border-[#e8e5e0] overflow-hidden">
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          className={`px-3 py-1 text-[11px] transition-colors ${
            value === m.value
              ? "bg-[#37352f] text-white"
              : "bg-white text-[#73726e] hover:bg-[#f7f6f3]"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
