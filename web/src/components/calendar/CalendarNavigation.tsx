"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarNavigationProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function CalendarNavigation({
  label,
  onPrev,
  onNext,
  onToday,
}: CalendarNavigationProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
        className="h-7 text-[11px] px-2.5"
      >
        Aujourd&apos;hui
      </Button>
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <span className="text-sm font-medium text-[#37352f] capitalize">
        {label}
      </span>
    </div>
  );
}
