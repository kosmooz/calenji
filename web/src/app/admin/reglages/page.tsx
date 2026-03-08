"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Send } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [tab, setTab] = useState<"general" | "company" | "email" | "maintenance">("general");
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    apiFetch("/api/admin/shop-settings").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setForm(data);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/admin/shop-settings", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Reglages mis a jour");
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    try {
      const res = await apiFetch("/api/admin/shop-settings/test-smtp", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Email de test envoye !");
      } else {
        toast.error(data.error || "Echec de l'envoi");
      }
    } finally {
      setTestingSmtp(false);
    }
  };

  const set = (key: string, value: any) => setForm({ ...form, [key]: value });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const tabs = [
    { id: "general" as const, label: "General" },
    { id: "company" as const, label: "Societe" },
    { id: "email" as const, label: "Email" },
    { id: "maintenance" as const, label: "Maintenance" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Reglages</h1>
        <Button onClick={handleSave} disabled={submitting} className="gap-2">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {tab === "general" && (
            <>
              <div className="space-y-2">
                <Label>Nom du site</Label>
                <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Slogan</Label>
                <Input value={form.slogan || ""} onChange={(e) => set("slogan", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                <Input value={form.timezone || ""} onChange={(e) => set("timezone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email admin (notifications)</Label>
                <Input type="email" value={form.adminEmail || ""} onChange={(e) => set("adminEmail", e.target.value)} />
              </div>
            </>
          )}

          {tab === "company" && (
            <>
              <div className="space-y-2">
                <Label>Raison sociale</Label>
                <Input value={form.companyName || ""} onChange={(e) => set("companyName", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SIRET</Label>
                  <Input value={form.siret || ""} onChange={(e) => set("siret", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>N. TVA</Label>
                  <Input value={form.tvaNumber || ""} onChange={(e) => set("tvaNumber", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse societe</Label>
                <Input value={form.companyStreet || ""} onChange={(e) => set("companyStreet", e.target.value)} placeholder="Rue" />
                <Input value={form.companyStreet2 || ""} onChange={(e) => set("companyStreet2", e.target.value)} placeholder="Complement" />
                <div className="grid grid-cols-2 gap-4">
                  <Input value={form.companyPostalCode || ""} onChange={(e) => set("companyPostalCode", e.target.value)} placeholder="Code postal" />
                  <Input value={form.companyCity || ""} onChange={(e) => set("companyCity", e.target.value)} placeholder="Ville" />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Representant legal - Prenom</Label>
                  <Input value={form.legalFirstName || ""} onChange={(e) => set("legalFirstName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Representant legal - Nom</Label>
                  <Input value={form.legalLastName || ""} onChange={(e) => set("legalLastName", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email legal</Label>
                <Input type="email" value={form.legalEmail || ""} onChange={(e) => set("legalEmail", e.target.value)} />
              </div>
            </>
          )}

          {tab === "email" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Serveur SMTP</Label>
                  <Input value={form.smtpHost || ""} onChange={(e) => set("smtpHost", e.target.value)} placeholder="smtp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Port SMTP</Label>
                  <Input type="number" value={form.smtpPort || ""} onChange={(e) => set("smtpPort", parseInt(e.target.value) || null)} placeholder="465" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Utilisateur SMTP</Label>
                  <Input value={form.smtpUser || ""} onChange={(e) => set("smtpUser", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe SMTP</Label>
                  <Input type="password" value={form.smtpPass || ""} onChange={(e) => set("smtpPass", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email expediteur (From)</Label>
                <Input type="email" value={form.smtpFrom || ""} onChange={(e) => set("smtpFrom", e.target.value)} />
              </div>
              <Separator />
              <Button variant="outline" onClick={handleTestSmtp} disabled={testingSmtp} className="gap-2">
                {testingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Envoyer un email de test
              </Button>
            </>
          )}

          {tab === "maintenance" && (
            <>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.maintenanceEnabled || false}
                  onChange={(e) => set("maintenanceEnabled", e.target.checked)}
                />
                Mode maintenance active
              </label>
              <div className="space-y-2">
                <Label>Mode</Label>
                <select
                  value={form.maintenanceMode || "FULL_BLOCK"}
                  onChange={(e) => set("maintenanceMode", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="FULL_BLOCK">Blocage complet</option>
                  <option value="ORDERS_BLOCKED">Commandes bloquees</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Titre maintenance</Label>
                <Input value={form.maintenanceTitle || ""} onChange={(e) => set("maintenanceTitle", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description maintenance</Label>
                <Textarea value={form.maintenanceDescription || ""} onChange={(e) => set("maintenanceDescription", e.target.value)} rows={3} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
