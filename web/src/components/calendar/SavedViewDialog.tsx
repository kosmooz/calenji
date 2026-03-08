"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Instagram, Facebook, Check } from "lucide-react";
import Dialog from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Account {
  id: string;
  platform: "INSTAGRAM" | "FACEBOOK";
  accountName: string;
  isActive: boolean;
}

interface SavedView {
  id: string;
  name: string;
  socialAccountIds: string[];
  position: number;
}

interface SavedViewDialogProps {
  open: boolean;
  onClose: () => void;
  editingView: SavedView | null;
  onSaved: () => void;
}

export default function SavedViewDialog({
  open,
  onClose,
  editingView,
  onSaved,
}: SavedViewDialogProps) {
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      apiFetch("/api/social-auth/accounts")
        .then((r) => r.json())
        .then((data) => setAccounts(data.filter((a: Account) => a.isActive)));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (editingView) {
        setName(editingView.name);
        setSelectedIds(editingView.socialAccountIds);
      } else {
        setName("");
        setSelectedIds([]);
      }
    }
  }, [open, editingView]);

  const toggleAccount = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Sélectionnez au moins un compte");
      return;
    }

    setSaving(true);
    try {
      const body = { name: name.trim(), socialAccountIds: selectedIds };
      const res = editingView
        ? await apiFetch(`/api/calendar-views/${editingView.id}`, {
            method: "PATCH",
            body: JSON.stringify(body),
          })
        : await apiFetch("/api/calendar-views", {
            method: "POST",
            body: JSON.stringify(body),
          });

      if (res.ok) {
        toast.success(editingView ? "Vue modifiée" : "Vue créée");
        onSaved();
        onClose();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editingView ? "Modifier la vue" : "Nouvelle vue"}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-[#37352f] mb-1.5">
            Nom de la vue
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Instagram, Comptes pro..."
            className="w-full h-9 px-3 text-sm border border-[#e8e5e0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#37352f]/20 focus:border-[#37352f]"
          />
        </div>

        {/* Account selection */}
        <div>
          <label className="block text-xs font-medium text-[#37352f] mb-1.5">
            Comptes à inclure
          </label>
          <div className="border border-[#e8e5e0] rounded-md divide-y divide-[#e8e5e0]">
            {accounts.map((a) => (
              <button
                key={a.id}
                onClick={() => toggleAccount(a.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  selectedIds.includes(a.id)
                    ? "bg-[#f7f6f3] text-[#37352f]"
                    : "text-[#73726e] hover:bg-[#f7f6f3]"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    selectedIds.includes(a.id)
                      ? "bg-[#37352f] border-[#37352f]"
                      : "border-[#d3d1cb]"
                  }`}
                >
                  {selectedIds.includes(a.id) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                {a.platform === "INSTAGRAM" ? (
                  <Instagram className="h-4 w-4 flex-shrink-0 text-pink-500" />
                ) : (
                  <Facebook className="h-4 w-4 flex-shrink-0 text-blue-600 fill-blue-600" />
                )}
                <span className="truncate">{a.accountName}</span>
              </button>
            ))}
            {accounts.length === 0 && (
              <p className="px-3 py-3 text-xs text-[#9b9a97]">
                Aucun compte connecté
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#37352f] text-white hover:bg-[#37352f]/90"
          >
            {saving ? "..." : editingView ? "Enregistrer" : "Créer la vue"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
