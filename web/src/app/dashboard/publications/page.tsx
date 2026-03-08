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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PublishStatusBadge from "@/components/social/PublishStatusBadge";
import Dialog from "@/components/ui/dialog";
import PostComposer from "@/components/composer/PostComposer";
import StoryComposer from "@/components/composer/StoryComposer";

interface PostItem {
  id: string;
  caption: string | null;
  status: string;
  contentType: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  media: { localUrl: string; type: string }[];
  accounts: {
    status: string;
    socialAccount: { id: string; platform: string; accountName: string };
  }[];
}

const STATUS_FILTERS = [
  { value: "", label: "Tous" },
  { value: "DRAFT", label: "Brouillons" },
  { value: "SCHEDULED", label: "Programmés" },
  { value: "PUBLISHED", label: "Publiés" },
  { value: "FAILED", label: "Échoués" },
];

export default function PublicationsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerEditId, setComposerEditId] = useState<string | null>(null);
  const [storyComposerOpen, setStoryComposerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await apiFetch(`/api/posts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.items || []);
      }
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openNewComposer = () => {
    setComposerEditId(null);
    setComposerOpen(true);
  };

  const openEditComposer = (id: string) => {
    setComposerEditId(id);
    setComposerOpen(true);
  };

  const handleComposerSaved = () => {
    setComposerOpen(false);
    setComposerEditId(null);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette publication ?")) return;
    const res = await apiFetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Publication supprimée");
      fetchPosts();
    } else {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDuplicate = async (id: string) => {
    const res = await apiFetch(`/api/posts/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      toast.success("Publication dupliquée");
      fetchPosts();
    }
  };

  const handlePublishNow = async (id: string) => {
    if (!confirm("Publier maintenant ?")) return;
    const res = await apiFetch(`/api/posts/${id}/publish-now`, { method: "POST" });
    if (res.ok) {
      toast.success("Publication en cours...");
      fetchPosts();
    } else {
      toast.error("Erreur lors de la publication");
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
            Gérez vos publications Instagram et Facebook.
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

      {/* Filters */}
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
      {!loading && posts.length === 0 && (
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
      {!loading && posts.length > 0 && (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-[#e8e5e0] hover:shadow-sm transition-shadow"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-md bg-[#f7f6f3] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {post.media?.[0] ? (
                  <img
                    src={post.media[0].localUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="h-5 w-5 text-[#c4c3c0]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#37352f] truncate">
                  {post.caption || "Sans texte"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <PublishStatusBadge status={post.status} />
                  {post.accounts.map((a) => (
                    <span key={a.socialAccount.id} className="text-[10px] text-[#9b9a97]">
                      {a.socialAccount.platform === "INSTAGRAM" ? "📷" : "📘"}{" "}
                      {a.socialAccount.accountName}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-[#c4c3c0] mt-0.5">
                  {post.scheduledAt
                    ? `Programmé : ${formatDate(post.scheduledAt)}`
                    : `Créé : ${formatDate(post.createdAt)}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                {["DRAFT", "SCHEDULED"].includes(post.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditComposer(post.id)}
                    className="h-7 w-7 p-0"
                    title="Modifier"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {["DRAFT", "SCHEDULED", "FAILED"].includes(post.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePublishNow(post.id)}
                    className="h-7 w-7 p-0"
                    title="Publier maintenant"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicate(post.id)}
                  className="h-7 w-7 p-0"
                  title="Dupliquer"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                {["DRAFT", "SCHEDULED", "FAILED"].includes(post.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
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
      )}

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
        onClose={() => setStoryComposerOpen(false)}
        title="Nouvelle story"
        maxWidth="max-w-4xl"
      >
        <StoryComposer
          key="new-story"
          onSaved={() => {
            setStoryComposerOpen(false);
            fetchPosts();
          }}
        />
      </Dialog>
    </div>
  );
}
