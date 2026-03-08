"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { FileText, Image, Pencil, Trash2, Play, Move, Copy, X, LayoutTemplate, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarNavigation from "./CalendarNavigation";
import CalendarViewToggle, { type CalendarViewMode } from "./CalendarViewToggle";
import CalendarMonthView from "./CalendarMonthView";
import CalendarWeekView from "./CalendarWeekView";
import CalendarDayView from "./CalendarDayView";
import AccountFilter from "@/components/social/AccountFilter";
import SavedViewTabs from "./SavedViewTabs";
import SavedViewDialog from "./SavedViewDialog";
import PublishStatusBadge from "@/components/social/PublishStatusBadge";
import PostDetailDialog from "@/components/composer/PostDetailDialog";
import StoryDetailDialog from "@/components/composer/StoryDetailDialog";
import Dialog from "@/components/ui/dialog";
import PostComposer from "@/components/composer/PostComposer";
import StoryComposer from "@/components/composer/StoryComposer";
import TemplateStoryCard from "./TemplateStoryCard";
import ConfirmDialog from "@/components/ui/confirm-dialog";

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
  accountNames: string[];
  platformAccounts: { platform: string; accountName: string; accountAvatar: string | null }[];
}

interface DraftItem {
  id: string;
  caption: string | null;
  status: string;
  contentType: string;
  createdAt: string;
  media: { localUrl: string; type: string }[];
  accounts: {
    socialAccount: { id: string; platform: string; accountName: string; accountAvatar: string | null };
  }[];
}

interface DraftStoryItem {
  id: string;
  status: string;
  createdAt: string;
  media: { localUrl: string; type: string }[];
  accounts: {
    socialAccount: { id: string; platform: string; accountName: string; accountAvatar: string | null };
  }[];
}

interface StoryTemplate {
  id: string;
  name: string | null;
  scheduledTime: string | null;
  socialAccountIds: string[];
  media: { localUrl: string; type: string }[];
}

export default function CalendarView() {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [storyDrafts, setStoryDrafts] = useState<DraftStoryItem[]>([]);
  const [accountFilters, setAccountFilters] = useState<string[]>([]);
  const [templates, setTemplates] = useState<StoryTemplate[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<{ id: string; platform: string }[]>([]);

  // Saved views state
  const [savedViews, setSavedViews] = useState<{ id: string; name: string; socialAccountIds: string[]; position: number }[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingView, setEditingView] = useState<{ id: string; name: string; socialAccountIds: string[]; position: number } | null>(null);

  // Post detail dialog state
  const [detailPostId, setDetailPostId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Story detail dialog state
  const [detailStoryId, setDetailStoryId] = useState<string | null>(null);
  const [storyDetailOpen, setStoryDetailOpen] = useState(false);

  // Post composer dialog state
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerEditId, setComposerEditId] = useState<string | null>(null);

  // Story composer dialog state
  const [storyComposerOpen, setStoryComposerOpen] = useState(false);
  const [storyComposerEditId, setStoryComposerEditId] = useState<string | null>(null);

  // Pre-filled scheduled date from cell click
  const [initialScheduledAt, setInitialScheduledAt] = useState<string | null>(null);

  // Template data for pre-filling story composer
  const [templateData, setTemplateData] = useState<{ mediaUrl: string; socialAccountIds: string[]; scheduledTime?: string | null } | null>(null);

  // Generic confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Cell click menu state
  const [cellMenu, setCellMenu] = useState<{ x: number; y: number; date: Date } | null>(null);
  const cellMenuRef = useRef<HTMLDivElement>(null);

  // Drop menu state
  const [dropMenu, setDropMenu] = useState<{ x: number; y: number; type: string; id: string; date: Date; originalDate: Date } | null>(null);
  const dropMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cellMenuRef.current && !cellMenuRef.current.contains(e.target as Node)) {
        setCellMenu(null);
      }
      if (dropMenuRef.current && !dropMenuRef.current.contains(e.target as Node)) {
        setDropMenu(null);
      }
    };
    if (cellMenu || dropMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cellMenu, dropMenu]);

  const getDateRange = useCallback(() => {
    const d = currentDate;
    if (viewMode === "month") {
      const from = new Date(d.getFullYear(), d.getMonth(), 1);
      const to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      return { from, to };
    }
    if (viewMode === "week") {
      const dayOfWeek = (d.getDay() + 6) % 7;
      const from = new Date(d);
      from.setDate(d.getDate() - dayOfWeek);
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setDate(from.getDate() + 6);
      to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    // day
    const from = new Date(d);
    from.setHours(0, 0, 0, 0);
    const to = new Date(d);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }, [currentDate, viewMode]);

  const fetchItems = useCallback(async () => {
    const { from, to } = getDateRange();
    const params = new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
    });
    accountFilters.forEach((id) => params.append("socialAccountId", id));

    try {
      const res = await apiFetch(`/api/calendar?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      toast.error("Erreur lors du chargement du calendrier");
    }
  }, [getDateRange, accountFilters]);

  const fetchDrafts = useCallback(async () => {
    try {
      const res = await apiFetch("/api/posts?status=DRAFT");
      if (res.ok) {
        const data = await res.json();
        setDrafts(data.items || []);
      }
    } catch {}
  }, []);

  const fetchStoryDrafts = useCallback(async () => {
    try {
      const res = await apiFetch("/api/stories?status=DRAFT");
      if (res.ok) {
        const data = await res.json();
        setStoryDrafts(data || []);
      }
    } catch {}
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await apiFetch("/api/story-templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchItems, 150);
    return () => clearTimeout(timeout);
  }, [fetchItems]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  useEffect(() => {
    fetchStoryDrafts();
  }, [fetchStoryDrafts]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    apiFetch("/api/social-auth/accounts")
      .then((r) => r.json())
      .then((data) => setSocialAccounts(data.map((a: any) => ({ id: a.id, platform: a.platform }))));
  }, []);

  const fetchSavedViews = useCallback(async () => {
    try {
      const res = await apiFetch("/api/calendar-views");
      if (res.ok) {
        const data = await res.json();
        setSavedViews(data || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchSavedViews();
  }, [fetchSavedViews]);

  const handleSelectView = (view: { id: string; name: string; socialAccountIds: string[]; position: number } | null) => {
    if (view) {
      setActiveViewId(view.id);
      setAccountFilters(view.socialAccountIds);
    } else {
      setActiveViewId(null);
      setAccountFilters([]);
    }
  };

  const handleAccountFilterChange = (ids: string[]) => {
    setAccountFilters(ids);
    setActiveViewId(null);
  };

  const handleDeleteView = (viewId: string) => {
    setConfirmDialog({
      title: "Supprimer cette vue ?",
      description: "Cette action est irréversible. La vue sera définitivement supprimée.",
      onConfirm: async () => {
        const res = await apiFetch(`/api/calendar-views/${viewId}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("Vue supprimée");
          if (activeViewId === viewId) {
            setActiveViewId(null);
            setAccountFilters([]);
          }
          fetchSavedViews();
        } else {
          toast.error("Erreur réseau");
        }
      },
    });
  };

  const navigate = (direction: -1 | 0 | 1) => {
    if (direction === 0) {
      setCurrentDate(new Date());
      return;
    }

    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + direction);
    else if (viewMode === "week") d.setDate(d.getDate() + 7 * direction);
    else d.setDate(d.getDate() + direction);
    setCurrentDate(d);
  };

  // Keyboard navigation: left/right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if ((e.target as HTMLElement)?.closest?.("[role='dialog']")) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); navigate(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); navigate(1); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentDate, viewMode]);

  const getLabel = () => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });
    }
    if (viewMode === "week") {
      const { from, to } = getDateRange();
      return `${from.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — ${to.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return currentDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const lastDropPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Track mouse position during drag for menu placement
  useEffect(() => {
    const track = (e: MouseEvent) => {
      lastDropPosition.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener("dragover", track);
    return () => document.removeEventListener("dragover", track);
  }, []);

  const handleReschedule = async (type: string, id: string, date: Date) => {
    // Template drop → create story directly from template
    if (type === "template") {
      const tpl = templates.find((t) => t.id === id);
      if (!tpl) return;
      const mediaUrl = tpl.media?.[0]?.localUrl;
      if (!mediaUrl) return;
      // Apply saved time from template if available
      const targetDate = new Date(date);
      if (tpl.scheduledTime) {
        const [h, m] = tpl.scheduledTime.split(":").map(Number);
        targetDate.setHours(h, m, 0, 0);
      }
      if (targetDate < new Date()) {
        toast.error("Impossible de programmer dans le passé");
        return;
      }
      try {
        const res = await apiFetch("/api/stories", {
          method: "POST",
          body: JSON.stringify({
            mediaUrl,
            socialAccountIds: tpl.socialAccountIds,
            scheduledAt: targetDate.toISOString(),
          }),
        });
        if (res.ok) {
          toast.success("Story créée depuis le modèle");
          fetchItems();
          fetchStoryDrafts();
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.message || "Erreur lors de la création");
        }
      } catch {
        toast.error("Erreur réseau");
      }
      return;
    }

    // Find original item to get its time
    const item = items.find((i) => i.type === type && i.id === id);
    const originalDate = item
      ? new Date(item.scheduledAt || item.publishedAt || "")
      : new Date();

    // Check if the item is being dropped on the same slot
    if (item) {
      if (
        originalDate.getFullYear() === date.getFullYear() &&
        originalDate.getMonth() === date.getMonth() &&
        originalDate.getDate() === date.getDate() &&
        originalDate.getHours() === date.getHours()
      ) {
        return; // Same slot, do nothing
      }
    }

    // Show drop menu
    setDropMenu({
      ...lastDropPosition.current,
      type,
      id,
      date,
      originalDate,
    });
  };

  const buildDateWithOriginalTime = (targetDay: Date, originalDate: Date) => {
    const result = new Date(targetDay);
    result.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);
    return result;
  };

  const executeMove = async (type: string, id: string, date: Date) => {
    if (date < new Date()) {
      toast.error("Impossible de programmer dans le passé");
      return;
    }
    try {
      const res = await apiFetch(`/api/calendar/${type}/${id}/reschedule`, {
        method: "PATCH",
        body: JSON.stringify({ scheduledAt: date.toISOString() }),
      });
      if (res.ok) {
        toast.success("Reprogrammé");
        fetchItems();
        fetchDrafts();
        fetchStoryDrafts();
        fetchTemplates();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erreur lors de la reprogrammation");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const executeDuplicate = async (type: string, id: string, targetDay: Date, originalDate: Date) => {
    const date = buildDateWithOriginalTime(targetDay, originalDate);
    if (date < new Date()) {
      toast.error("Impossible de programmer dans le passé");
      return;
    }
    const endpoint = type === "post"
      ? `/api/posts/${id}/duplicate`
      : `/api/stories/${id}/duplicate`;
    try {
      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ scheduledAt: date.toISOString() }),
      });
      if (res.ok) {
        toast.success("Dupliqué et programmé");
        fetchItems();
        fetchDrafts();
        fetchStoryDrafts();
        fetchTemplates();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erreur lors de la duplication");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const handleCellClick = (date: Date, e: React.MouseEvent) => {
    setCellMenu({ x: e.clientX, y: e.clientY, date });
  };

  const openPostFromCell = () => {
    if (!cellMenu) return;
    setInitialScheduledAt(cellMenu.date.toISOString());
    setComposerEditId(null);
    setComposerOpen(true);
    setCellMenu(null);
  };

  const openStoryFromCell = () => {
    if (!cellMenu) return;
    setInitialScheduledAt(cellMenu.date.toISOString());
    setStoryComposerEditId(null);
    setStoryComposerOpen(true);
    setCellMenu(null);
  };

  const handleItemClick = (type: string, id: string) => {
    if (type === "post") {
      setDetailPostId(id);
      setDetailOpen(true);
    } else if (type === "story") {
      setDetailStoryId(id);
      setStoryDetailOpen(true);
    }
  };

  const handleEditFromDetail = (id: string) => {
    setDetailOpen(false);
    setComposerEditId(id);
    setComposerOpen(true);
  };

  const handleStoryEditFromDetail = (id: string) => {
    setStoryDetailOpen(false);
    setStoryComposerEditId(id);
    setStoryComposerOpen(true);
  };

  const handleDuplicateFromDetail = async (id: string) => {
    const res = await apiFetch(`/api/posts/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      const newPost = await res.json();
      toast.success("Publication dupliquée");
      setDetailOpen(false);
      setDetailPostId(null);
      setComposerEditId(newPost.id);
      setComposerOpen(true);
      fetchItems();
      fetchDrafts();
    }
  };

  const handleComposerSaved = () => {
    setComposerOpen(false);
    setComposerEditId(null);
    setInitialScheduledAt(null);
    fetchItems();
    fetchDrafts();
    fetchTemplates();
  };

  const handleStoryComposerSaved = () => {
    setStoryComposerOpen(false);
    setStoryComposerEditId(null);
    setInitialScheduledAt(null);
    setTemplateData(null);
    fetchItems();
    fetchStoryDrafts();
    fetchTemplates();
  };

  const handleDeleteDraft = (id: string) => {
    setConfirmDialog({
      title: "Supprimer ce brouillon ?",
      description: "Cette action est irréversible. Le brouillon sera définitivement supprimé.",
      onConfirm: async () => {
        const res = await apiFetch(`/api/posts/${id}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("Brouillon supprimé");
          fetchDrafts();
          fetchTemplates();
        }
      },
    });
  };

  const handlePublishDraft = async (id: string) => {
    const res = await apiFetch(`/api/posts/${id}/publish-now`, { method: "POST" });
    if (res.ok) {
      toast.success("Publication en cours...");
      fetchDrafts();
      fetchItems();
      fetchTemplates();
    }
  };

  const handleDeleteStoryDraft = (id: string) => {
    setConfirmDialog({
      title: "Supprimer cette story brouillon ?",
      description: "Cette action est irréversible. La story sera définitivement supprimée.",
      onConfirm: async () => {
        const res = await apiFetch(`/api/stories/${id}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("Story supprimée");
          fetchStoryDrafts();
          fetchTemplates();
        }
      },
    });
  };

  const handlePublishStoryDraft = async (id: string) => {
    const res = await apiFetch(`/api/stories/${id}/publish-now`, { method: "POST" });
    if (res.ok) {
      toast.success("Publication en cours...");
      fetchStoryDrafts();
      fetchItems();
      fetchTemplates();
    }
  };

  const filteredTemplates = useMemo(() => {
    if (accountFilters.length === 0) return templates;
    return templates.filter((t) =>
      t.socialAccountIds.some((id) => accountFilters.includes(id))
    );
  }, [templates, accountFilters]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <CalendarNavigation
          label={getLabel()}
          onPrev={() => navigate(-1)}
          onNext={() => navigate(1)}
          onToday={() => navigate(0)}
        />
        <div className="flex items-center gap-2">
          <AccountFilter value={accountFilters} onChange={handleAccountFilterChange} />
          <CalendarViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Saved View Tabs */}
      <SavedViewTabs
        views={savedViews}
        activeViewId={activeViewId}
        onSelectView={handleSelectView}
        onCreateView={() => { setEditingView(null); setViewDialogOpen(true); }}
        onEditView={(view) => { setEditingView(view); setViewDialogOpen(true); }}
        onDeleteView={handleDeleteView}
      />

      {/* Calendar + Favorites row */}
      <div className="flex gap-4">
      <div className="flex-1 min-w-0 space-y-6">
      {/* Calendar View */}
      <div className="border border-[#e8e5e0] rounded-lg overflow-hidden">
        {viewMode === "month" && (
          <CalendarMonthView
            date={currentDate}
            items={items}
            onReschedule={handleReschedule}
            onItemClick={handleItemClick}
            onCellClick={handleCellClick}
          />
        )}
        {viewMode === "week" && (
          <CalendarWeekView
            date={currentDate}
            items={items}
            onReschedule={handleReschedule}
            onItemClick={handleItemClick}
            onCellClick={handleCellClick}
          />
        )}
        {viewMode === "day" && (
          <CalendarDayView
            date={currentDate}
            items={items}
            onReschedule={handleReschedule}
            onItemClick={handleItemClick}
            onCellClick={handleCellClick}
          />
        )}
      </div>
      </div>

      {/* Templates sidebar */}
      {filteredTemplates.length > 0 && (
        <div className="w-52 flex-shrink-0 space-y-3">
          <div className="flex items-center gap-1.5">
            <LayoutTemplate className="h-3.5 w-3.5 text-[#9b9a97]" />
            <h3 className="text-xs font-semibold text-[#37352f] uppercase tracking-wider">
              Modèles ({filteredTemplates.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {filteredTemplates.map((template) => (
              <TemplateStoryCard
                key={template.id}
                template={template}
                socialAccounts={socialAccounts}
                onClick={(t) => {
                  const mediaUrl = t.media?.[0]?.localUrl;
                  if (mediaUrl) {
                    setTemplateData({ mediaUrl, socialAccountIds: t.socialAccountIds, scheduledTime: t.scheduledTime });
                    setStoryComposerEditId(null);
                    setStoryComposerOpen(true);
                  }
                }}
                onDelete={(id) => setConfirmDialog({
                  title: "Supprimer ce modèle ?",
                  description: "Cette action est irréversible. Le modèle sera définitivement supprimé.",
                  onConfirm: async () => {
                    const res = await apiFetch(`/api/story-templates/${id}`, { method: "DELETE" });
                    if (res.ok) {
                      toast.success("Modèle supprimé");
                      fetchTemplates();
                    } else {
                      toast.error("Erreur lors de la suppression");
                    }
                  },
                })}
              />
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Post Drafts section */}
      {drafts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#37352f]">
            Brouillons — Publications ({drafts.length})
          </h3>
          <div className="space-y-2">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#e8e5e0] hover:shadow-sm transition-shadow bg-white"
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-md bg-[#f7f6f3] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {draft.media?.[0] ? (
                    <img
                      src={draft.media[0].localUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="h-4 w-4 text-[#c4c3c0]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#37352f] truncate">
                    {draft.caption || "Sans texte"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <PublishStatusBadge status={draft.status} />
                    {draft.accounts.map((a) => (
                      <span key={a.socialAccount.id} className="flex items-center gap-1 text-[10px] text-[#9b9a97]">
                        <span className="w-4 h-4 rounded-full bg-[#f7f6f3] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {a.socialAccount.accountAvatar ? (
                            <img src={a.socialAccount.accountAvatar} className="w-full h-full object-cover" alt="" />
                          ) : a.socialAccount.platform === "INSTAGRAM" ? (
                            <Instagram className="h-2.5 w-2.5 text-pink-500" />
                          ) : (
                            <Facebook className="h-2.5 w-2.5 text-blue-600 fill-blue-600" />
                          )}
                        </span>
                        {a.socialAccount.accountName}
                      </span>
                    ))}
                    <span className="text-[10px] text-[#c4c3c0]">
                      {formatDate(draft.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setComposerEditId(draft.id);
                      setComposerOpen(true);
                    }}
                    className="h-7 w-7 p-0"
                    title="Modifier"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePublishDraft(draft.id)}
                    className="h-7 w-7 p-0"
                    title="Publier maintenant"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="h-7 w-7 p-0 text-[#73726e] hover:text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story Drafts section */}
      {storyDrafts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#37352f]">
            Brouillons — Stories ({storyDrafts.length})
          </h3>
          <div className="space-y-2">
            {storyDrafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#e8e5e0] hover:shadow-sm transition-shadow bg-white"
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-md bg-[#f7f6f3] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {draft.media?.[0] ? (
                    <img
                      src={draft.media[0].localUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="h-4 w-4 text-[#c4c3c0]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#37352f] truncate">
                    Story
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <PublishStatusBadge status={draft.status} />
                    {draft.accounts.map((a) => (
                      <span key={a.socialAccount.id} className="flex items-center gap-1 text-[10px] text-[#9b9a97]">
                        <span className="w-4 h-4 rounded-full bg-[#f7f6f3] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {a.socialAccount.accountAvatar ? (
                            <img src={a.socialAccount.accountAvatar} className="w-full h-full object-cover" alt="" />
                          ) : a.socialAccount.platform === "INSTAGRAM" ? (
                            <Instagram className="h-2.5 w-2.5 text-pink-500" />
                          ) : (
                            <Facebook className="h-2.5 w-2.5 text-blue-600 fill-blue-600" />
                          )}
                        </span>
                        {a.socialAccount.accountName}
                      </span>
                    ))}
                    <span className="text-[10px] text-[#c4c3c0]">
                      {formatDate(draft.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStoryComposerEditId(draft.id);
                      setStoryComposerOpen(true);
                    }}
                    className="h-7 w-7 p-0"
                    title="Modifier"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePublishStoryDraft(draft.id)}
                    className="h-7 w-7 p-0"
                    title="Publier maintenant"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteStoryDraft(draft.id)}
                    className="h-7 w-7 p-0 text-[#73726e] hover:text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop context menu */}
      {dropMenu && (() => {
        const targetWithOriginalTime = buildDateWithOriginalTime(dropMenu.date, dropMenu.originalDate);
        const isPast = targetWithOriginalTime < new Date();
        return (
          <div
            ref={dropMenuRef}
            className="fixed z-50 bg-white rounded-lg border border-[#e8e5e0] shadow-lg py-1 w-48"
            style={{ left: dropMenu.x, top: dropMenu.y }}
          >
            <div className="px-3 py-1.5 text-[10px] text-[#9b9a97] uppercase font-medium border-b border-[#e8e5e0]">
              {targetWithOriginalTime.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {isPast && (
                <span className="text-red-400 ml-1">(passé)</span>
              )}
            </div>
            <button
              onClick={() => {
                const { type, id, originalDate } = dropMenu;
                const moveDate = buildDateWithOriginalTime(dropMenu.date, originalDate);
                setDropMenu(null);
                executeMove(type, id, moveDate);
              }}
              disabled={isPast}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                isPast ? "text-[#c4c3c0] cursor-not-allowed" : "text-[#37352f] hover:bg-[#f7f6f3]"
              }`}
            >
              <Move className="h-4 w-4 text-[#9b9a97]" />
              Déplacer
            </button>
            <button
              onClick={() => {
                const { type, id, date, originalDate } = dropMenu;
                setDropMenu(null);
                executeDuplicate(type, id, date, originalDate);
              }}
              disabled={isPast}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                isPast ? "text-[#c4c3c0] cursor-not-allowed" : "text-[#37352f] hover:bg-[#f7f6f3]"
              }`}
            >
              <Copy className="h-4 w-4 text-[#9b9a97]" />
              Dupliquer ici
            </button>
            <button
              onClick={() => setDropMenu(null)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#73726e] hover:bg-[#f7f6f3] transition-colors"
            >
              <X className="h-4 w-4 text-[#9b9a97]" />
              Annuler
            </button>
          </div>
        );
      })()}

      {/* Cell click context menu */}
      {cellMenu && (
        <div
          ref={cellMenuRef}
          className="fixed z-50 bg-white rounded-lg border border-[#e8e5e0] shadow-lg py-1 w-44"
          style={{ left: cellMenu.x, top: cellMenu.y }}
        >
          <div className="px-3 py-1.5 text-[10px] text-[#9b9a97] uppercase font-medium border-b border-[#e8e5e0]">
            {cellMenu.date.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <button
            onClick={openPostFromCell}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#37352f] hover:bg-[#f7f6f3] transition-colors"
          >
            <FileText className="h-4 w-4 text-[#9b9a97]" />
            Publication
          </button>
          <button
            onClick={openStoryFromCell}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#37352f] hover:bg-[#f7f6f3] transition-colors"
          >
            <Image className="h-4 w-4 text-[#9b9a97]" />
            Story
          </button>
        </div>
      )}

      {/* Post Detail Dialog */}
      <PostDetailDialog
        postId={detailPostId}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailPostId(null); }}
        onEdit={handleEditFromDetail}
        onDuplicate={handleDuplicateFromDetail}
        onDeleted={() => { fetchItems(); fetchDrafts(); fetchTemplates(); }}
      />

      {/* Story Detail Dialog */}
      <StoryDetailDialog
        storyId={detailStoryId}
        open={storyDetailOpen}
        onClose={() => { setStoryDetailOpen(false); setDetailStoryId(null); }}
        onEdit={handleStoryEditFromDetail}
        onDeleted={() => { fetchItems(); fetchStoryDrafts(); fetchTemplates(); }}
        onTemplateSaved={fetchTemplates}
      />

      {/* Post Composer Dialog */}
      <Dialog
        open={composerOpen}
        onClose={() => { setComposerOpen(false); setComposerEditId(null); setInitialScheduledAt(null); }}
        title={composerEditId ? "Modifier la publication" : "Nouvelle publication"}
        maxWidth="max-w-5xl"
      >
        <PostComposer
          key={composerEditId || initialScheduledAt || "new"}
          editId={composerEditId}
          onSaved={handleComposerSaved}
          initialScheduledAt={composerEditId ? undefined : initialScheduledAt}
        />
      </Dialog>

      {/* Story Composer Dialog */}
      <Dialog
        open={storyComposerOpen}
        onClose={() => { setStoryComposerOpen(false); setStoryComposerEditId(null); setInitialScheduledAt(null); setTemplateData(null); }}
        title={storyComposerEditId ? "Modifier la story" : "Nouvelle story"}
        maxWidth="max-w-4xl"
      >
        <StoryComposer
          key={storyComposerEditId || initialScheduledAt || (templateData ? "template" : "new-story")}
          editId={storyComposerEditId}
          onSaved={handleStoryComposerSaved}
          onTemplateSaved={fetchTemplates}
          initialScheduledAt={storyComposerEditId ? undefined : initialScheduledAt}
          templateData={templateData}
        />
      </Dialog>
      {/* Saved View Dialog */}
      <SavedViewDialog
        open={viewDialogOpen}
        onClose={() => { setViewDialogOpen(false); setEditingView(null); }}
        editingView={editingView}
        onSaved={fetchSavedViews}
      />

      {/* Confirm dialog (deletions) */}
      <ConfirmDialog
        open={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        onConfirm={async () => {
          if (!confirmDialog) return;
          setConfirmLoading(true);
          await confirmDialog.onConfirm();
          setConfirmLoading(false);
          setConfirmDialog(null);
        }}
        title={confirmDialog?.title || ""}
        description={confirmDialog?.description}
        confirmLabel="Supprimer"
        variant="danger"
        loading={confirmLoading}
      />
    </div>
  );
}
