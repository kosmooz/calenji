"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  FileText,
  Image,
  Pencil,
  Trash2,
  Copy,
  Play,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PublishStatusBadge from "@/components/social/PublishStatusBadge";
import Dialog from "@/components/ui/dialog";
import PostComposer from "@/components/composer/PostComposer";
import StoryComposer from "@/components/composer/StoryComposer";
import PostDetailDialog from "@/components/composer/PostDetailDialog";
import StoryDetailDialog from "@/components/composer/StoryDetailDialog";
import AccountFilter from "@/components/social/AccountFilter";
import ConfirmDialog from "@/components/ui/confirm-dialog";

interface ListItem {
  id: string;
  type: "post" | "story";
  caption: string | null;
  status: string;
  contentType: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  media: { localUrl: string; type: string }[];
  accounts: {
    status: string;
    socialAccount: { id: string; platform: string; accountName: string; accountAvatar: string | null };
  }[];
}

const STATUS_FILTERS = [
  { value: "", label: "Tous" },
  { value: "DRAFT", label: "Brouillons" },
  { value: "SCHEDULED", label: "Programmés" },
  { value: "PUBLISHED", label: "Publiés" },
  { value: "FAILED", label: "Échoués" },
];

const ITEMS_PER_PAGE = 20;

const TYPE_FILTERS = [
  { value: "", label: "Tous" },
  { value: "post", label: "Publications" },
  { value: "story", label: "Stories" },
];

export default function PublicationsPage() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "post" | "story">("");
  const [accountFilter, setAccountFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerEditId, setComposerEditId] = useState<string | null>(null);
  const [storyComposerOpen, setStoryComposerOpen] = useState(false);
  const [storyEditId, setStoryEditId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const menuRef = useRef<HTMLDivElement>(null);

  // Detail dialog states
  const [detailPostId, setDetailPostId] = useState<string | null>(null);
  const [detailPostOpen, setDetailPostOpen] = useState(false);
  const [detailStoryId, setDetailStoryId] = useState<string | null>(null);
  const [detailStoryOpen, setDetailStoryOpen] = useState(false);

  // Confirm dialog state
  const [confirmItem, setConfirmItem] = useState<ListItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<"delete" | "publish" | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const buildParams = () => {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (accountFilter.length > 0) params.set("socialAccountId", accountFilter[0]);
        if (dateFrom) params.set("from", dateFrom);
        if (dateTo) params.set("to", dateTo);
        return params;
      };

      const fetches: Promise<ListItem[]>[] = [];

      if (typeFilter !== "story") {
        fetches.push(
          apiFetch(`/api/posts?${buildParams()}`)
            .then((r) => (r.ok ? r.json() : { items: [] }))
            .then((data) =>
              (data.items || []).map((p: Record<string, unknown>) => ({ ...p, type: "post" as const }))
            )
        );
      }

      if (typeFilter !== "post") {
        fetches.push(
          apiFetch(`/api/stories?${buildParams()}`)
            .then((r) => (r.ok ? r.json() : []))
            .then((data) =>
              (Array.isArray(data) ? data : data.items || []).map((s: Record<string, unknown>) => ({ ...s, type: "story" as const }))
            )
        );
      }

      const results = await Promise.all(fetches);
      const merged = results.flat();
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setItems(merged);
      setPage(1);
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, accountFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openNewComposer = () => {
    setComposerEditId(null);
    setComposerOpen(true);
  };

  const openEditComposer = (item: ListItem) => {
    if (item.type === "story") {
      setStoryEditId(item.id);
      setStoryComposerOpen(true);
    } else {
      setComposerEditId(item.id);
      setComposerOpen(true);
    }
  };

  const openDetail = (item: ListItem) => {
    if (item.type === "story") {
      setDetailStoryId(item.id);
      setDetailStoryOpen(true);
    } else {
      setDetailPostId(item.id);
      setDetailPostOpen(true);
    }
  };

  const handleEditFromDetail = (id: string) => {
    setDetailPostOpen(false);
    setDetailPostId(null);
    setComposerEditId(id);
    setComposerOpen(true);
  };

  const handleStoryEditFromDetail = (id: string) => {
    setDetailStoryOpen(false);
    setDetailStoryId(null);
    setStoryEditId(id);
    setStoryComposerOpen(true);
  };

  const handleDuplicateFromDetail = async (id: string) => {
    const res = await apiFetch(`/api/posts/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      const newItem = await res.json();
      toast.success("Publication dupliquée");
      setDetailPostOpen(false);
      setDetailPostId(null);
      setHighlightId(`post-${newItem.id}`);
      await fetchItems();
      setTimeout(() => setHighlightId(null), 2000);
    }
  };

  const handleComposerSaved = () => {
    setComposerOpen(false);
    setComposerEditId(null);
    fetchItems();
  };

  const handleStoryComposerSaved = () => {
    setStoryComposerOpen(false);
    setStoryEditId(null);
    fetchItems();
  };

  const askDelete = (item: ListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmItem(item);
    setConfirmAction("delete");
  };

  const askPublishNow = (item: ListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmItem(item);
    setConfirmAction("publish");
  };

  const handleConfirm = async () => {
    if (!confirmItem || !confirmAction) return;
    setConfirmLoading(true);
    try {
      if (confirmAction === "delete") {
        const endpoint = confirmItem.type === "story" ? `/api/stories/${confirmItem.id}` : `/api/posts/${confirmItem.id}`;
        const res = await apiFetch(endpoint, { method: "DELETE" });
        if (res.ok) {
          toast.success(confirmItem.type === "story" ? "Story supprimée" : "Publication supprimée");
          fetchItems();
        } else {
          toast.error("Erreur lors de la suppression");
        }
      } else {
        const endpoint = confirmItem.type === "story" ? `/api/stories/${confirmItem.id}/publish-now` : `/api/posts/${confirmItem.id}/publish-now`;
        const res = await apiFetch(endpoint, { method: "POST" });
        if (res.ok) {
          toast.success("Publication en cours...");
          fetchItems();
        } else {
          toast.error("Erreur lors de la publication");
        }
      }
    } finally {
      setConfirmLoading(false);
      setConfirmItem(null);
      setConfirmAction(null);
    }
  };

  const handleDuplicate = async (item: ListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const endpoint = item.type === "story" ? `/api/stories/${item.id}/duplicate` : `/api/posts/${item.id}/duplicate`;
    const res = await apiFetch(endpoint, { method: "POST" });
    if (res.ok) {
      const newItem = await res.json();
      toast.success(item.type === "story" ? "Story dupliquée" : "Publication dupliquée");
      setHighlightId(`${item.type}-${newItem.id}`);
      await fetchItems();
      setTimeout(() => setHighlightId(null), 2000);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#37352f]">Publications</h1>
          <p className="text-sm text-[#73726e] mt-1">
            Gérez vos publications et stories Instagram et Facebook.
          </p>
        </div>
        <div className="relative" ref={menuRef}>
          <Button
            onClick={() => setMenuOpen(!menuOpen)}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Créer
          </Button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg border border-[#e8e5e0] shadow-lg z-50 py-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  openNewComposer();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#37352f] hover:bg-[#f7f6f3] transition-colors"
              >
                <FileText className="h-4 w-4 text-[#9b9a97]" />
                Publication
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setStoryEditId(null);
                  setStoryComposerOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#37352f] hover:bg-[#f7f6f3] transition-colors"
              >
                <Image className="h-4 w-4 text-[#9b9a97]" />
                Story
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2">
        <AccountFilter value={accountFilter} onChange={setAccountFilter} />

        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#9b9a97]" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-8 text-xs border border-[#e8e5e0] rounded-md px-2.5 bg-white text-[#37352f] hover:bg-[#f7f6f3] transition-colors"
            placeholder="Du"
          />
          <span className="text-xs text-[#9b9a97]">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-8 text-xs border border-[#e8e5e0] rounded-md px-2.5 bg-white text-[#37352f] hover:bg-[#f7f6f3] transition-colors"
            placeholder="Au"
          />
        </div>

        <div className="flex gap-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value as "" | "post" | "story")}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                typeFilter === f.value
                  ? "bg-[#37352f] text-white"
                  : "bg-[#f7f6f3] text-[#73726e] hover:bg-[#eeede9]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-1.5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
              statusFilter === f.value
                ? "bg-[#37352f] text-white"
                : "bg-[#f7f6f3] text-[#73726e] hover:bg-[#eeede9]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#9b9a97]" />
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16 border border-dashed border-[#e8e5e0] rounded-lg">
          <FileText className="h-10 w-10 text-[#c4c3c0] mx-auto mb-3" />
          <p className="text-sm text-[#73726e] mb-4">Aucune publication</p>
          <Button
            onClick={openNewComposer}
            variant="outline"
            className="h-8 text-xs"
          >
            Créer une publication
          </Button>
        </div>
      )}

      {/* List */}
      {!loading && items.length > 0 && (() => {
        const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
        const paginatedItems = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
        return (<>
        <div className="space-y-2">
          {paginatedItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => openDetail(item)}
              className={`flex items-center gap-3 p-3 rounded-lg border border-[#e8e5e0] hover:shadow-sm transition-all cursor-pointer ${
                highlightId === `${item.type}-${item.id}`
                  ? "animate-highlight-fade"
                  : ""
              }`}
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-md bg-[#f7f6f3] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                {item.media?.[0] ? (
                  item.media[0].type === "VIDEO" ? (
                    <>
                      <video
                        src={item.media[0].localUrl}
                        muted
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.media[0].localUrl}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <FileText className="h-5 w-5 text-[#c4c3c0]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#37352f] truncate">
                  {item.caption || (item.type === "story" ? <em className="text-[#9b9a97]">Story</em> : "Sans texte")}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <PublishStatusBadge status={item.status} />
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      item.type === "story"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {item.type === "story" ? "Story" : "Publication"}
                  </span>
                  {item.accounts.map((a) => (
                    <span key={a.socialAccount.id} className="flex items-center gap-1 text-[10px] text-[#9b9a97]">
                      {a.socialAccount.accountAvatar ? (
                        <img
                          src={a.socialAccount.accountAvatar}
                          alt={a.socialAccount.accountName}
                          className="h-4 w-4 rounded-full object-cover"
                        />
                      ) : (
                        <span className="h-4 w-4 rounded-full bg-[#e8e5e0] flex items-center justify-center text-[8px] font-medium text-[#73726e]">
                          {a.socialAccount.accountName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      {a.socialAccount.accountName}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-[#c4c3c0] mt-0.5">
                  {`Créé : ${formatDate(item.createdAt)}`}
                  {item.scheduledAt && ` · Programmé : ${formatDate(item.scheduledAt)}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); openDetail(item); }}
                  className="h-7 w-7 p-0"
                  title="Voir les détails"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                {["DRAFT", "SCHEDULED"].includes(item.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); openEditComposer(item); }}
                    className="h-7 w-7 p-0"
                    title="Modifier"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {["DRAFT", "SCHEDULED", "FAILED"].includes(item.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => askPublishNow(item, e)}
                    className="h-7 w-7 p-0"
                    title="Publier maintenant"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDuplicate(item, e)}
                  className="h-7 w-7 p-0"
                  title="Dupliquer"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                {["DRAFT", "SCHEDULED", "FAILED"].includes(item.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => askDelete(item, e)}
                    className="h-7 w-7 p-0 text-[#73726e] hover:text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-[#9b9a97]">
              {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, items.length)} sur {items.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1]) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-1 text-xs text-[#9b9a97]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-7 min-w-[1.75rem] px-1.5 rounded-md text-xs transition-colors ${
                        page === p
                          ? "bg-[#37352f] text-white"
                          : "text-[#73726e] hover:bg-[#f7f6f3]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
        </>);
      })()}

      {/* Post Detail Dialog */}
      <PostDetailDialog
        postId={detailPostId}
        open={detailPostOpen}
        onClose={() => { setDetailPostOpen(false); setDetailPostId(null); }}
        onEdit={handleEditFromDetail}
        onDuplicate={handleDuplicateFromDetail}
        onDeleted={() => { setDetailPostOpen(false); setDetailPostId(null); fetchItems(); }}
      />

      {/* Story Detail Dialog */}
      <StoryDetailDialog
        storyId={detailStoryId}
        open={detailStoryOpen}
        onClose={() => { setDetailStoryOpen(false); setDetailStoryId(null); }}
        onEdit={handleStoryEditFromDetail}
        onDeleted={() => { setDetailStoryOpen(false); setDetailStoryId(null); fetchItems(); }}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmItem && !!confirmAction}
        onClose={() => { setConfirmItem(null); setConfirmAction(null); }}
        onConfirm={handleConfirm}
        title={
          confirmAction === "delete"
            ? confirmItem?.type === "story" ? "Supprimer cette story ?" : "Supprimer cette publication ?"
            : "Publier maintenant ?"
        }
        description={
          confirmAction === "delete"
            ? "Cette action est irréversible."
            : "La publication sera envoyée immédiatement."
        }
        confirmLabel={confirmAction === "delete" ? "Supprimer" : "Publier"}
        variant={confirmAction === "delete" ? "danger" : "default"}
        loading={confirmLoading}
      />

      {/* Post Composer Dialog */}
      <Dialog
        open={composerOpen}
        onClose={() => { setComposerOpen(false); setComposerEditId(null); }}
        title={composerEditId ? "Modifier la publication" : "Nouvelle publication"}
        maxWidth="max-w-5xl"
      >
        <PostComposer
          key={composerEditId || "new"}
          editId={composerEditId}
          onSaved={handleComposerSaved}
        />
      </Dialog>

      {/* Story Composer Dialog */}
      <Dialog
        open={storyComposerOpen}
        onClose={() => { setStoryComposerOpen(false); setStoryEditId(null); }}
        title={storyEditId ? "Modifier la story" : "Nouvelle story"}
        maxWidth="max-w-4xl"
      >
        <StoryComposer
          key={storyEditId || "new-story"}
          editId={storyEditId}
          onSaved={handleStoryComposerSaved}
        />
      </Dialog>
    </div>
  );
}
