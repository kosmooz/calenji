"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connexion en cours...");
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage("Autorisation refusée par Facebook");
      setTimeout(() => router.push("/dashboard/reseaux"), 2000);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("Code d'autorisation manquant");
      setTimeout(() => router.push("/dashboard/reseaux"), 2000);
      return;
    }

    apiFetch("/api/social-auth/connect", {
      method: "POST",
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          const count = data.accounts?.length || 0;
          setStatus("success");
          setMessage(
            `${count} compte${count > 1 ? "s" : ""} connecté${count > 1 ? "s" : ""} avec succès !`
          );
          toast.success(`${count} compte(s) connecté(s)`);
        } else {
          const err = await res.json().catch(() => ({}));
          setStatus("error");
          setMessage(err.message || "Erreur lors de la connexion");
          toast.error("Erreur lors de la connexion des comptes");
        }
        setTimeout(() => router.push("/dashboard/reseaux"), 2000);
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erreur réseau");
        setTimeout(() => router.push("/dashboard/reseaux"), 2000);
      });
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      {status === "loading" && (
        <Loader2 className="h-8 w-8 animate-spin text-[#9b9a97]" />
      )}
      {status === "success" && (
        <CheckCircle className="h-8 w-8 text-green-500" />
      )}
      {status === "error" && (
        <XCircle className="h-8 w-8 text-red-500" />
      )}
      <p className="text-sm text-[#37352f]">{message}</p>
    </div>
  );
}
