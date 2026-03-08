"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import MediaUploadZone from "./MediaUploadZone";
import MediaGrid from "./MediaGrid";
import PlatformSelector from "./PlatformSelector";
import SchedulePicker from "./SchedulePicker";
import PostPreview from "./PostPreview";

interface AccountInfo {
  id: string;
  platform: "INSTAGRAM" | "FACEBOOK";
  accountName: string;
  accountAvatar: string | null;
  isActive: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface PostComposerProps {
  editId?: string | null;
  onSaved?: () => void;
  initialScheduledAt?: string | null;
}

export default function PostComposer({ editId: editIdProp, onSaved, initialScheduledAt }: PostComposerProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Support both prop-based and URL-based editId
  const editId = editIdProp !== undefined ? editIdProp : searchParams.get("id");

  const [caption, setCaption] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [socialAccountIds, setSocialAccountIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState<string | null>(initialScheduledAt ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Load accounts for preview
  useEffect(() => {
    apiFetch("/api/social-auth/accounts")
      .then((r) => r.json())
      .then((data) => setAccounts(data.filter((a: AccountInfo) => a.isActive)));
  }, []);

  // Load existing post for editing
  useEffect(() => {
    if (!editId) {
      setCaption("");
      setMediaUrls([]);
      setSocialAccountIds([]);
      setScheduledAt(initialScheduledAt ?? null);
      return;
    }
    apiFetch(`/api/posts/${editId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const post = await r.json();
        setCaption(post.caption || "");
        setMediaUrls(post.media?.map((m: any) => m.localUrl) || []);
        setSocialAccountIds(post.accounts?.map((a: any) => a.socialAccount.id) || []);
        if (post.scheduledAt) setScheduledAt(post.scheduledAt);
      })
      .catch(() => toast.error("Publication introuvable"));
  }, [editId]);

  // Debounced validation
  const runValidation = useCallback(() => {
    if (!socialAccountIds.length) {
      setValidation(null);
      return;
    }
    apiFetch("/api/posts/validate", {
      method: "POST",
      body: JSON.stringify({
        socialAccountIds,
        caption,
        mediaUrls,
      }),
    })
      .then((r) => r.json())
      .then((data: ValidationResult) => setValidation(data))
      .catch(() => {});
  }, [socialAccountIds, caption, mediaUrls]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runValidation, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [runValidation]);

  const selectedAccounts = accounts.filter((a) =>
    socialAccountIds.includes(a.id),
  );

  // Character limit based on selected platforms
  const hasIG = selectedAccounts.some((a) => a.platform === "INSTAGRAM");
  const charLimit = hasIG ? 2200 : 63206;

  // Dynamic accept for MediaUploadZone
  const mediaAccept = hasIG
    ? "image/jpeg,image/png,video/mp4"
    : "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,video/mp4,video/quicktime";

  const isValid = validation === null || validation.valid;
  const isPastDate = scheduledAt ? new Date(scheduledAt) < new Date() : false;

  const handleSave = async (asDraft: boolean) => {
    if (!socialAccountIds.length) {
      toast.error("Sélectionnez au moins un compte");
      return;
    }
    setSaving(true);
    try {
      const body = {
        caption,
        mediaUrls,
        socialAccountIds,
        scheduledAt: asDraft ? undefined : scheduledAt,
      };

      const res = editId
        ? await apiFetch(`/api/posts/${editId}`, {
            method: "PATCH",
            body: JSON.stringify(body),
          })
        : await apiFetch("/api/posts", {
            method: "POST",
            body: JSON.stringify(body),
          });

      if (res.ok) {
        toast.success(asDraft ? "Brouillon enregistré" : scheduledAt ? "Publication programmée" : "Brouillon enregistré");
        if (onSaved) {
          onSaved();
        } else {
          router.push("/dashboard/publications");
        }
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = Array.isArray(err.message)
          ? err.message.join(", ")
          : err.message || "Erreur lors de la sauvegarde";
        toast.error(msg);
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Composer */}
      <div className="space-y-4">
        {/* Caption */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#37352f]">
            Texte de la publication
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Écrivez votre publication..."
            rows={6}
            className="w-full text-sm border border-[#e8e5e0] rounded-md px-3 py-2 bg-white text-[#37352f] placeholder:text-[#c4c3c0] focus:outline-none focus:ring-1 focus:ring-black/10 resize-none"
          />
          <div className="flex justify-end">
            <span
              className={`text-[10px] ${
                caption.length > charLimit ? "text-red-500" : "text-[#9b9a97]"
              }`}
            >
              {caption.length} / {charLimit}
            </span>
          </div>
        </div>

        {/* Media */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#37352f]">Médias</label>
          <MediaGrid
            urls={mediaUrls}
            onRemove={(i) => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}
            onReorder={setMediaUrls}
          />
          <MediaUploadZone
            onUpload={(newUrls) => setMediaUrls([...mediaUrls, ...newUrls])}
            uploading={uploading}
            setUploading={setUploading}
            accept={mediaAccept}
          />
        </div>

        {/* Validation warnings/errors */}
        {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
          <div className="space-y-1.5">
            {validation.errors.map((err, i) => (
              <p key={`err-${i}`} className="text-xs text-red-600 bg-red-50 rounded px-2.5 py-1.5">
                {err}
              </p>
            ))}
            {validation.warnings.map((warn, i) => (
              <p key={`warn-${i}`} className="text-xs text-orange-600 bg-orange-50 rounded px-2.5 py-1.5">
                {warn}
              </p>
            ))}
          </div>
        )}

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
            type="button"
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="h-8 text-xs gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Brouillon
          </Button>
          <Button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving || caption.length > charLimit || !isValid || isPastDate}
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
          <div className="space-y-4">
            {selectedAccounts.map((account) => (
              <PostPreview
                key={account.id}
                caption={caption}
                mediaUrls={mediaUrls}
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
