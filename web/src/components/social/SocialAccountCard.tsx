"use client";

import { Instagram, Facebook, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialAccountCardProps {
  account: {
    id: string;
    platform: "INSTAGRAM" | "FACEBOOK";
    accountName: string;
    accountAvatar: string | null;
    isActive: boolean;
    metaUserTokenExp: string | null;
  };
  onDisconnect: (id: string) => void;
  onReconnect: (id: string) => void;
}

export default function SocialAccountCard({
  account,
  onDisconnect,
  onReconnect,
}: SocialAccountCardProps) {
  const isIG = account.platform === "INSTAGRAM";
  const expiresSoon =
    account.metaUserTokenExp &&
    new Date(account.metaUserTokenExp).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-[#e8e5e0] bg-white hover:shadow-sm transition-shadow">
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isIG
            ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
            : "bg-[#1877F2]"
        }`}
      >
        {account.accountAvatar ? (
          <img
            src={account.accountAvatar}
            alt={account.accountName}
            className="w-9 h-9 rounded-full object-cover border-2 border-white"
          />
        ) : isIG ? (
          <Instagram className="h-5 w-5 text-white" />
        ) : (
          <Facebook className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#37352f] truncate">
            {account.accountName}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              isIG
                ? "bg-pink-50 text-pink-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {isIG ? "Instagram" : "Facebook"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {!account.isActive ? (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Déconnecté
            </span>
          ) : expiresSoon ? (
            <span className="text-xs text-orange-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Token expire bientôt
            </span>
          ) : (
            <span className="text-xs text-green-600">Connecté</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {!account.isActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReconnect(account.id)}
            className="h-8 w-8 p-0 text-[#73726e] hover:text-[#37352f]"
            title="Reconnecter"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDisconnect(account.id)}
          className="h-8 w-8 p-0 text-[#73726e] hover:text-red-500"
          title="Déconnecter"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
