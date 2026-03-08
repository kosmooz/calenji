"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#f7f6f3] transition-colors text-[#73726e]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`mx-auto w-11 h-11 rounded-full flex items-center justify-center mb-4 ${
            isDanger ? "bg-red-50" : "bg-[#f7f6f3]"
          }`}>
            <AlertTriangle className={`h-5 w-5 ${isDanger ? "text-red-500" : "text-[#9b9a97]"}`} />
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-[#37352f] mb-1">{title}</h3>

          {/* Description */}
          {description && (
            <p className="text-xs text-[#73726e] mb-5">{description}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-center mt-5">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-8 text-xs px-4"
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              className={`h-8 text-xs px-4 ${
                isDanger ? "bg-red-500 hover:bg-red-600 text-white" : ""
              }`}
            >
              {loading ? "Suppression..." : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
