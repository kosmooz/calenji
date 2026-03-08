"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SchedulePickerProps {
  value: string | null;
  onChange: (iso: string | null) => void;
}

export default function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const [mode, setMode] = useState<"now" | "schedule">(value ? "schedule" : "now");

  // Sync mode when value changes externally (e.g. after async fetch)
  useEffect(() => {
    if (value) setMode("schedule");
  }, [value]);

  const isPast = value ? new Date(value) < new Date() : false;

  const formatDateForInput = (iso: string | null): string => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleDateChange = (iso: string) => {
    const selected = new Date(iso);
    if (selected < new Date()) {
      // Don't block the input, but keep the value so user sees the warning
      onChange(selected.toISOString());
      return;
    }
    onChange(selected.toISOString());
  };

  const presets = [
    {
      label: "Demain 9h",
      getValue: () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(9, 0, 0, 0);
        return d.toISOString();
      },
    },
    {
      label: "Demain 12h",
      getValue: () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(12, 0, 0, 0);
        return d.toISOString();
      },
    },
    {
      label: "Demain 18h",
      getValue: () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(18, 0, 0, 0);
        return d.toISOString();
      },
    },
  ];

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-[#37352f]">
        Programmation
      </label>

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => {
            setMode("now");
            onChange(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
            mode === "now"
              ? "bg-[#37352f] text-white"
              : "bg-[#f7f6f3] text-[#73726e] hover:bg-[#eeede9]"
          }`}
        >
          <Clock className="h-3 w-3" />
          Brouillon
        </button>
        <button
          type="button"
          onClick={() => setMode("schedule")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
            mode === "schedule"
              ? "bg-[#37352f] text-white"
              : "bg-[#f7f6f3] text-[#73726e] hover:bg-[#eeede9]"
          }`}
        >
          <Calendar className="h-3 w-3" />
          Programmer
        </button>
      </div>

      {mode === "schedule" && (
        <div className="space-y-2">
          <input
            type="datetime-local"
            value={formatDateForInput(value)}
            onChange={(e) => {
              if (e.target.value) {
                handleDateChange(new Date(e.target.value).toISOString());
              }
            }}
            min={formatDateForInput(new Date().toISOString())}
            className={`w-full h-8 text-xs border rounded-md px-2 bg-white text-[#37352f] focus:outline-none focus:ring-1 ${
              isPast
                ? "border-red-300 focus:ring-red-200"
                : "border-[#e8e5e0] focus:ring-black/10"
            }`}
          />
          {isPast && (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              La date est dans le passé. Choisissez une date future.
            </div>
          )}
          <div className="flex gap-1.5">
            {presets.map((p) => (
              <Button
                key={p.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange(p.getValue())}
                className="h-6 text-[10px] px-2"
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
