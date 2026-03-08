"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  Pencil,
  Copy,
  Play,
  Trash2,
  Loader2,
  Calendar,
  Instagram,
  Facebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import PublishStatusBadge from "@/components/social/PublishStatusBadge";

interface PostDetailDialogProps {
  postId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDeleted?: () => void;
}

interface PostDetail {
  id: string;
  caption: string | null;
  contentType: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  reelCoverUrl: string | null;
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

export default function PostDetailDialog({
  postId,
  open,
  onClose,
  onEdit,
  onDuplicate,
  onDeleted,
}: PostDetailDialogProps) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!postId || !open) {
      setPost(null);
      return;
    }
    setLoading(true);
    apiFetch(`/api/posts/${postId}`)
      .then(async (r) => {
        if (r.ok) setPost(await r.json());
        else toast.error("Publication introuvable");
      })
      .catch(() => toast.error("Erreur réseau"))
      .finally(() => setLoading(false));
  }, [postId, open]);

  const canEdit = post && ["DRAFT", "SCHEDULED"].includes(post.status);
  const canPublish = post && ["DRAFT", "SCHEDULED", "FAILED"].includes(post.status);
  const canDelete = post && ["DRAFT", "SCHEDULED", "FAILED"].includes(post.status);

  const handlePublishNow = async () => {
    if (!post || !confirm("Publier maintenant ?")) return;
    const res = await apiFetch(`/api/posts/${post.id}/publish-now`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success("Publication en cours...");
      onClose();
    } else {
      toast.error("Erreur lors de la publication");
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    setDeleting(true);
    const res = await apiFetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Publication supprimée");
      setConfirmDeleteOpen(false);
      onClose();
      onDeleted?.();
    } else {
      toast.error("Erreur lors de la suppression");
    }
    setDeleting(false);
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
    <Dialog open={open} onClose={onClose} title="Détails de la publication">
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#9b9a97]" />
        </div>
      )}

      {!loading && post && (
        <div className="space-y-5">
          {/* Status + Type */}
          <div className="flex items-center gap-2 flex-wrap">
            <PublishStatusBadge status={post.status} />
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f7f6f3] text-[#73726e] uppercase font-medium">
              {post.contentType}
            </span>
          </div>

          {/* Media */}
          {post.media.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {post.media.map((m, i) => (
                <div
                  key={i}
                  className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-[#f7f6f3]"
                >
                  {m.type === "VIDEO" ? (
                    <video
                      src={m.localUrl}
                      className="w-full h-full object-cover"
                      muted
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

          {/* Caption */}
          {post.caption && (
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-[#9b9a97] uppercase">
                Texte
              </label>
              <p className="text-sm text-[#37352f] whitespace-pre-line bg-[#f7f6f3] rounded-lg p-3 max-h-40 overflow-y-auto">
                {post.caption}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="flex flex-wrap gap-4 text-xs text-[#73726e]">
            {post.scheduledAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Programmé : {formatDate(post.scheduledAt)}
              </div>
            )}
            {post.publishedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Publié : {formatDate(post.publishedAt)}
              </div>
            )}
            {!post.scheduledAt && !post.publishedAt && (
              <div>Créé : {formatDate(post.createdAt)}</div>
            )}
          </div>

          {/* Accounts */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-[#9b9a97] uppercase">
              Comptes
            </label>
            <div className="space-y-1.5">
              {post.accounts.map((a) => (
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
            {canEdit && onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onEdit(post.id);
                }}
                className="h-8 text-xs gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Modifier
              </Button>
            )}
            {onDuplicate && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onDuplicate(post.id);
                }}
                className="h-8 text-xs gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                Dupliquer
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
        title="Supprimer cette publication ?"
        description="Cette action est irréversible. La publication sera définitivement supprimée."
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </Dialog>
  );
}
