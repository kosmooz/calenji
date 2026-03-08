"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Instagram, Facebook, Check } from "lucide-react";

interface Account {
  id: string;
  platform: "INSTAGRAM" | "FACEBOOK";
  accountName: string;
  accountAvatar: string | null;
  isActive: boolean;
}

interface PlatformSelectorProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export default function PlatformSelector({ selected, onChange }: PlatformSelectorProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    apiFetch("/api/social-auth/accounts")
      .then((r) => r.json())
      .then((data) => setAccounts(data.filter((a: Account) => a.isActive)));
  }, []);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };

  if (!accounts.length) {
    return (
      <p className="text-xs text-[#9b9a97]">
        Aucun compte connecté.{" "}
        <a href="/dashboard/reseaux" className="underline">
          Connecter un compte
        </a>
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#37352f]">
        Comptes cibles
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {accounts.map((account) => {
          const isSelected = selected.includes(account.id);
          const isIG = account.platform === "INSTAGRAM";
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => toggle(account.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-md border text-left transition-all ${
                isSelected
                  ? "border-[#37352f] bg-[#f7f6f3]"
                  : "border-[#e8e5e0] hover:border-[#c4c3c0]"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isIG
                    ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                    : "bg-[#1877F2]"
                }`}
              >
                {isIG ? (
                  <Instagram className="h-3.5 w-3.5 text-white" />
                ) : (
                  <Facebook className="h-3.5 w-3.5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#37352f] truncate">
                  {account.accountName}
                </div>
                <div className="text-[10px] text-[#9b9a97]">
                  {isIG ? "Instagram" : "Facebook"}
                </div>
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-[#37352f] flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
