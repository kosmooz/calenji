"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Share2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SocialAccountCard from "@/components/social/SocialAccountCard";

interface SocialAccount {
  id: string;
  platform: "INSTAGRAM" | "FACEBOOK";
  accountName: string;
  accountAvatar: string | null;
  isActive: boolean;
  metaUserTokenExp: string | null;
  createdAt: string;
}

export default function ReseauxPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await apiFetch("/api/social-auth/accounts");
      if (res.ok) setAccounts(await res.json());
    } catch {
      toast.error("Erreur lors du chargement des comptes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleConnect = async () => {
    try {
      const res = await apiFetch("/api/social-auth/connect-url");
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Erreur lors de la connexion");
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Voulez-vous vraiment déconnecter ce compte ?")) return;
    try {
      const res = await apiFetch(`/api/social-auth/accounts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Compte déconnecté");
        fetchAccounts();
      } else {
        toast.error("Erreur lors de la déconnexion");
      }
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const handleReconnect = async (id: string) => {
    try {
      const res = await apiFetch(`/api/social-auth/accounts/${id}/reconnect`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Erreur lors de la reconnexion");
    }
  };

  const activeAccounts = accounts.filter((a) => a.isActive);
  const inactiveAccounts = accounts.filter((a) => !a.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#37352f]">
            Réseaux sociaux
          </h1>
          <p className="text-sm text-[#73726e] mt-1">
            Connectez vos comptes Instagram et Facebook pour publier du contenu.
          </p>
        </div>
        <Button
          onClick={handleConnect}
          className="h-8 text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Connecter
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#9b9a97]" />
        </div>
      )}

      {/* Empty state */}
      {!loading && accounts.length === 0 && (
        <div className="text-center py-16 border border-dashed border-[#e8e5e0] rounded-lg">
          <Share2 className="h-10 w-10 text-[#c4c3c0] mx-auto mb-3" />
          <p className="text-sm text-[#73726e] mb-4">
            Aucun compte connecté
          </p>
          <Button
            onClick={handleConnect}
            variant="outline"
            className="h-8 text-xs"
          >
            Connecter un compte Facebook / Instagram
          </Button>
        </div>
      )}

      {/* Active accounts */}
      {activeAccounts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-[#9b9a97] uppercase tracking-wider">
            Comptes actifs
          </h2>
          <div className="space-y-2">
            {activeAccounts.map((account) => (
              <SocialAccountCard
                key={account.id}
                account={account}
                onDisconnect={handleDisconnect}
                onReconnect={handleReconnect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive accounts */}
      {inactiveAccounts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-[#9b9a97] uppercase tracking-wider">
            Comptes désactivés
          </h2>
          <div className="space-y-2">
            {inactiveAccounts.map((account) => (
              <SocialAccountCard
                key={account.id}
                account={account}
                onDisconnect={handleDisconnect}
                onReconnect={handleReconnect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
