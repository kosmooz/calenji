"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Save, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import MediaUploadZone from "./MediaUploadZone";
import PlatformSelector from "./PlatformSelector";
import SchedulePicker from "./SchedulePicker";
import StoryPreview from "./StoryPreview";

interface AccountInfo {
  id: string;
  platform: "INSTAGRAM" | "FACEBOOK";
  accountName: string;
  accountAvatar: string | null;
  isActive: boolean;
}

interface StoryComposerProps {
  editId?: string | null;
  onSaved?: () => void;
  initialScheduledAt?: string | null;
}

export default function StoryComposer({ editId, onSaved, initialScheduledAt }: StoryComposerProps) {
  const router = useRouter();

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [socialAccountIds, setSocialAccountIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState<string | null>(initialScheduledAt ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loadingEdit, setLoadingEdit] = useState(false);

  useEffect(() => {
    apiFetch("/api/social-auth/accounts")
      .then((r) => r.json())
      .then((data) => setAccounts(data.filter((a: AccountInfo) => a.isActive)));
  }, []);

  // Load existing story for editing
  useEffect(() => {
    if (!editId) {
      setMediaUrl(null);
      setSocialAccountIds([]);
      setScheduledAt(initialScheduledAt ?? null);
      return;
    }
    setLoadingEdit(true);
    apiFetch(`/api/stories/${editId}`)
      .then(async (r) => {
        if (r.ok) {
          const story = await r.json();
          setMediaUrl(story.media?.[0]?.localUrl || null);
          setSocialAccountIds(
            story.accounts?.map((a: any) => a.socialAccount?.id || a.socialAccountId) || [],
          );
          setScheduledAt(story.scheduledAt || null);
        }
      })
      .finally(() => setLoadingEdit(false));
  }, [editId]);

  const selectedAccounts = accounts.filter((a) =>
    socialAccountIds.includes(a.id),
  );

  const handleSave = async (asDraft: boolean) => {
    if (!mediaUrl) {
      toast.error("Ajoutez un média pour la story");
      return;
    }
    if (!socialAccountIds.length) {
      toast.error("Sélectionnez au moins un compte");
      return;
    }
    setSaving(true);
    try {
      const url = editId ? `/api/stories/${editId}` : "/api/stories";
      const method = editId ? "PATCH" : "POST";
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({
          mediaUrl,
          socialAccountIds,
          scheduledAt: asDraft ? undefined : scheduledAt,
        }),
      });

      if (res.ok) {
        toast.success(
          asDraft
            ? "Brouillon enregistré"
            : scheduledAt
              ? "Story programmée"
              : "Brouillon enregistré",
        );
        if (onSaved) {
          onSaved();
        } else {
          router.push("/dashboard/publications");
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erreur lors de la sauvegarde");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const isVideo = mediaUrl && /\.(mp4|webm|mov)$/i.test(mediaUrl);
  const isPastDate = scheduledAt ? new Date(scheduledAt) < new Date() : false;

  const hasIG = selectedAccounts.some((a) => a.platform === "INSTAGRAM");
  const hasFB = selectedAccounts.some((a) => a.platform === "FACEBOOK");

  // Dimension validation
  const [mediaDimensions, setMediaDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!mediaUrl) {
      setMediaDimensions(null);
      return;
    }
    const ext = mediaUrl.split("?")[0].split(".").pop()?.toLowerCase() || "";
    const isVid = ["mp4", "webm", "mov"].includes(ext);

    if (isVid) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setMediaDimensions({ width: video.videoWidth, height: video.videoHeight });
      };
      video.onerror = () => setMediaDimensions(null);
      video.src = mediaUrl;
    } else {
      const img = new window.Image();
      img.onload = () => {
        setMediaDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => setMediaDimensions(null);
      img.src = mediaUrl;
    }
  }, [mediaUrl]);

  const dimensionErrors: string[] = [];
  if (mediaDimensions) {
    const { width, height } = mediaDimensions;
    const ratio = height / width;

    if (width < 500) {
      dimensionErrors.push(`Largeur trop petite (${width}px). Minimum recommandé : 500px`);
    }
    if (width > height) {
      dimensionErrors.push(`Le format paysage (${width}×${height}) n'est pas adapté aux stories. Utilisez un format portrait (9:16)`);
    } else if (ratio < 1.2) {
      dimensionErrors.push(`Le format est trop carré (${width}×${height}). Les stories nécessitent un format portrait, idéalement 9:16 (1080×1920)`);
    } else if (ratio < 1.5) {
      dimensionErrors.push(`Ratio non optimal (${width}×${height}). Recommandé : 9:16 (1080×1920). Votre média pourrait être recadré`);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Composer */}
      <div className="space-y-4">
        {/* Media */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#37352f]">
            Média (1 image ou 1 vidéo)
          </label>
          {mediaUrl ? (
            <div className="relative aspect-[9/16] max-w-[240px] rounded-lg overflow-hidden border border-[#e8e5e0]">
              {isVideo ? (
                <video src={mediaUrl} className="w-full h-full object-cover" muted controls />
              ) : (
                <img src={mediaUrl} className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => setMediaUrl(null)}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded"
              >
                Supprimer
              </button>
            </div>
          ) : (
            <MediaUploadZone
              onUpload={(urls) => urls[0] && setMediaUrl(urls[0])}
              uploading={uploading}
              setUploading={setUploading}
              maxFiles={1}
              accept="image/jpeg,image/png,image/bmp,image/gif,video/mp4,video/quicktime,video/webm"
            />
          )}
          {dimensionErrors.length > 0 && (
            <div className="space-y-1">
              {dimensionErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-red-500">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  {err}
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-[#9b9a97]">
            Format recommandé : portrait 9:16 (1080×1920). Largeur min : 500px.
            {hasIG ? " Instagram : JPEG, PNG, MP4." : ""}
            {hasFB ? " Facebook : JPEG, PNG, BMP, GIF, MP4, MOV." : ""}
            {!hasIG && !hasFB ? " Sélectionnez un compte pour voir les formats acceptés." : ""}
          </p>
        </div>

        {/* Accounts */}
        <PlatformSelector
          selected={socialAccountIds}
          onChange={setSocialAccountIds}
        />

        {/* Schedule */}
        <SchedulePicker value={scheduledAt} onChange={setScheduledAt} />

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="h-8 text-xs gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Brouillon
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={saving || isPastDate || dimensionErrors.length > 0}
            className="h-8 text-xs gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            {scheduledAt ? "Programmer" : "Enregistrer"}
          </Button>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="space-y-4">
        <h3 className="text-xs font-medium text-[#9b9a97] uppercase tracking-wider">
          Aperçu
        </h3>
        {selectedAccounts.length === 0 ? (
          <p className="text-xs text-[#c4c3c0]">
            Sélectionnez un compte pour voir l&apos;aperçu
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {selectedAccounts.map((account) => (
              <StoryPreview
                key={account.id}
                mediaUrl={mediaUrl}
                platform={account.platform}
                accountName={account.accountName}
                accountAvatar={account.accountAvatar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
