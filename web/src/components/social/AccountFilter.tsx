"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { Instagram, Facebook, ChevronDown, Check } from "lucide-react";

interface Account {
  id: string;
  platform: "INSTAGRAM" | "FACEBOOK";
  accountName: string;
  isActive: boolean;
}

interface AccountFilterProps {
  value: string[];
  onChange: (accountIds: string[]) => void;
}

export default function AccountFilter({ value, onChange }: AccountFilterProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch("/api/social-auth/accounts")
      .then((r) => r.json())
      .then((data) => setAccounts(data.filter((a: Account) => a.isActive)));
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const toggleAccount = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const getLabel = () => {
    if (value.length === 0) return "Tous les comptes";
    if (value.length === 1) {
      const account = accounts.find((a) => a.id === value[0]);
      return account?.accountName || "1 compte";
    }
    return `${value.length} comptes`;
  };

  const getLabelIcon = () => {
    if (value.length === 1) {
      const account = accounts.find((a) => a.id === value[0]);
      if (account?.platform === "INSTAGRAM") return <Instagram className="h-3.5 w-3.5 text-pink-500" />;
      if (account?.platform === "FACEBOOK") return <Facebook className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />;
    }
    return null;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="h-8 flex items-center gap-1.5 text-xs border border-[#e8e5e0] rounded-md px-2.5 bg-white text-[#37352f] hover:bg-[#f7f6f3] transition-colors"
      >
        {getLabelIcon()}
        <span>{getLabel()}</span>
        <ChevronDown className="h-3 w-3 text-[#9b9a97]" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white rounded-lg border border-[#e8e5e0] shadow-lg py-1 w-max min-w-[12rem]">
          <button
            onClick={() => { onChange([]); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
              value.length === 0 ? "bg-[#f7f6f3] font-medium text-[#37352f]" : "text-[#37352f] hover:bg-[#f7f6f3]"
            }`}
          >
            {value.length === 0 && <Check className="h-3.5 w-3.5 text-[#37352f]" />}
            <span className={value.length === 0 ? "" : "pl-[22px]"}>Tous les comptes</span>
          </button>
          {accounts.map((a) => (
            <button
              key={a.id}
              onClick={() => toggleAccount(a.id)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                value.includes(a.id) ? "bg-[#f7f6f3] font-medium text-[#37352f]" : "text-[#37352f] hover:bg-[#f7f6f3]"
              }`}
            >
              {value.includes(a.id) ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0 text-[#37352f]" />
              ) : (
                <span className="w-3.5 flex-shrink-0" />
              )}
              {a.platform === "INSTAGRAM" ? (
                <Instagram className="h-3.5 w-3.5 flex-shrink-0 text-pink-500" />
              ) : (
                <Facebook className="h-3.5 w-3.5 flex-shrink-0 text-blue-600 fill-blue-600" />
              )}
              <span className="truncate">{a.accountName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
