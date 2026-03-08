"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  Pencil,
  Play,
  Trash2,
  Loader2,
  Calendar,
  Instagram,
  Facebook,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import PublishStatusBadge from "@/components/social/PublishStatusBadge";

interface StoryDetailDialogProps {
  storyId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDeleted?: () => void;
  onTemplateSaved?: () => void;
}

interface StoryDetail {
  id: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  media: { localUrl: string; type: string; position: number }[];
  accounts: {
    status: string;
    platformPostId: string | null;
    errorMessage: string | null;
    publishedAt: string | null;
    socialAccount: {
      id: string;
      platform: string;
      accountName: string;
      accountAvatar: string | null;
    };
  }[];
}

export default function StoryDetailDialog({
  storyId,
  open,
  onClose,
  onEdit,
  onDeleted,
  onTemplateSaved,
}: StoryDetailDialogProps) {
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!storyId || !open) {
      setStory(null);
      return;
    }
    setLoading(true);
    apiFetch(`/api/stories/${storyId}`)
      .then(async (r) => {
        if (r.ok) setStory(await r.json());
        else toast.error("Story introuvable");
      })
      .catch(() => toast.error("Erreur réseau"))
      .finally(() => setLoading(false));
  }, [storyId, open]);

  const canEdit = story && ["DRAFT", "SCHEDULED"].includes(story.status);
  const canPublish = story && ["DRAFT", "SCHEDULED", "FAILED"].includes(story.status);
  const canDelete = story && ["DRAFT", "SCHEDULED", "FAILED"].includes(story.status);

  const handlePublishNow = async () => {
    if (!story || !confirm("Publier maintenant ?")) return;
    const res = await apiFetch(`/api/stories/${story.id}/publish-now`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success("Publication en cours...");
      onClose();
      onDeleted?.();
    } else {
      toast.error("Erreur lors de la publication");
    }
  };

  const handleDelete = async () => {
    if (!story) return;
    setDeleting(true);
    const res = await apiFetch(`/api/stories/${story.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Story supprimée");
      setConfirmDeleteOpen(false);
      onClose();
      onDeleted?.();
    } else {
      toast.error("Erreur lors de la suppression");
    }
    setDeleting(false);
  };

  const handleSaveAsTemplate = async () => {
    if (!story) return;
    try {
      // Extract time from scheduledAt if available
      let scheduledTime: string | undefined;
      if (story.scheduledAt) {
        const d = new Date(story.scheduledAt);
        scheduledTime = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
      }
      const res = await apiFetch("/api/story-templates", {
        method: "POST",
        body: JSON.stringify({ storyId: story.id, scheduledTime }),
      });
      if (res.ok) {
        toast.success("Modèle enregistré");
        onTemplateSaved?.();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erreur lors de l'enregistrement du modèle");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Dialog open={open} onClose={onClose} title="Détails de la story">
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#9b9a97]" />
        </div>
      )}

      {!loading && story && (
        <div className="space-y-5">
          {/* Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <PublishStatusBadge status={story.status} />
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f7f6f3] text-[#73726e] uppercase font-medium">
              Story
            </span>
          </div>

          {/* Media */}
          {story.media.length > 0 && (
            <div className="flex gap-2 justify-center">
              {story.media.map((m, i) => (
                <div
                  key={i}
                  className="w-40 aspect-[9/16] flex-shrink-0 rounded-lg overflow-hidden bg-[#f7f6f3]"
                >
                  {m.type === "VIDEO" ? (
                    <video
                      src={m.localUrl}
                      className="w-full h-full object-cover"
                      muted
                      controls
                    />
                  ) : (
                    <img
                      src={m.localUrl}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Dates */}
          <div className="flex flex-wrap gap-4 text-xs text-[#73726e]">
            {story.scheduledAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Programmé : {formatDate(story.scheduledAt)}
              </div>
            )}
            {story.publishedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Publié : {formatDate(story.publishedAt)}
              </div>
            )}
            {!story.scheduledAt && !story.publishedAt && (
              <div>Créé : {formatDate(story.createdAt)}</div>
            )}
          </div>

          {/* Accounts */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-[#9b9a97] uppercase">
              Comptes
            </label>
            <div className="space-y-1.5">
              {story.accounts.map((a) => (
                <div
                  key={a.socialAccount.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-[#f7f6f3] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {a.socialAccount.accountAvatar ? (
                      <img
                        src={a.socialAccount.accountAvatar}
                        className="w-full h-full object-cover"
                      />
                    ) : a.socialAccount.platform === "INSTAGRAM" ? (
                      <Instagram className="h-3 w-3 text-[#9b9a97]" />
                    ) : (
                      <Facebook className="h-3 w-3 text-[#9b9a97]" />
                    )}
                  </div>
                  <span className="text-[#37352f] font-medium">
                    {a.socialAccount.accountName}
                  </span>
                  <PublishStatusBadge status={a.status} />
                  {a.errorMessage && (
                    <span className="text-red-500 text-[10px] truncate max-w-[200px]" title={a.errorMessage}>
                      {a.errorMessage}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-[#e8e5e0]">
            <Button
              variant="outline"
              onClick={handleSaveAsTemplate}
              className="h-8 text-xs gap-1.5"
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              Modèle
            </Button>
            {canEdit && onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onEdit(story.id);
                }}
                className="h-8 text-xs gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Modifier
              </Button>
            )}
            {canPublish && (
              <Button
                variant="outline"
                onClick={handlePublishNow}
                className="h-8 text-xs gap-1.5"
              >
                <Play className="h-3.5 w-3.5" />
                Publier
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteOpen(true)}
                className="h-8 text-xs gap-1.5 text-red-500 hover:text-red-600 hover:border-red-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </Button>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer cette story ?"
        description="Cette action est irréversible. La story sera définitivement supprimée."
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </Dialog>
  );
}
