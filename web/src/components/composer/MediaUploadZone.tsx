"use client";

import { useCallback, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface MediaUploadZoneProps {
  onUpload: (urls: string[]) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  maxFiles?: number;
  accept?: string;
}

export default function MediaUploadZone({
  onUpload,
  uploading,
  setUploading,
  maxFiles = 10,
  accept = "image/jpeg,image/png,image/webp,video/mp4",
}: MediaUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).slice(0, maxFiles);
      if (!fileArray.length) return;

      setUploading(true);
      try {
        const formData = new FormData();
        fileArray.forEach((f) => formData.append("files", f));

        const res = await apiFetch("/api/upload/images", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          onUpload(data.urls || []);
        } else {
          toast.error("Erreur lors de l'upload");
        }
      } catch {
        toast.error("Erreur lors de l'upload");
      } finally {
        setUploading(false);
      }
    },
    [onUpload, setUploading, maxFiles],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className="border-2 border-dashed border-[#e8e5e0] rounded-lg p-6 text-center cursor-pointer hover:border-[#c4c3c0] transition-colors"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />
      {uploading ? (
        <Loader2 className="h-6 w-6 animate-spin text-[#9b9a97] mx-auto" />
      ) : (
        <>
          <Upload className="h-6 w-6 text-[#c4c3c0] mx-auto mb-2" />
          <p className="text-xs text-[#9b9a97]">
            Glissez vos fichiers ici ou cliquez pour parcourir
          </p>
          <p className="text-[10px] text-[#c4c3c0] mt-1">
            Images (JPEG, PNG, WebP) et vidéos (MP4) — max {maxFiles} fichiers
          </p>
        </>
      )}
    </div>
  );
}
