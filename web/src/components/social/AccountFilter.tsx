"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Instagram, Facebook } from "lucide-react";

interface Account {
  id: string;
  platform: "INSTAGRAM" | "FACEBOOK";
  accountName: string;
  isActive: boolean;
}

interface AccountFilterProps {
  value: string | null;
  onChange: (accountId: string | null) => void;
}

export default function AccountFilter({ value, onChange }: AccountFilterProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    apiFetch("/api/social-auth/accounts")
      .then((r) => r.json())
      .then((data) => setAccounts(data.filter((a: Account) => a.isActive)));
  }, []);

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-8 text-xs border border-[#e8e5e0] rounded-md px-2 bg-white text-[#37352f] focus:outline-none focus:ring-1 focus:ring-black/10"
    >
      <option value="">Tous les comptes</option>
      {accounts.map((a) => (
        <option key={a.id} value={a.id}>
          {a.platform === "INSTAGRAM" ? "📷" : "📘"} {a.accountName}
        </option>
      ))}
    </select>
  );
}
