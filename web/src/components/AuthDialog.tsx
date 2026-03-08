"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

type View = "login" | "register" | "forgot" | "code";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { login, verifyLoginCode, register } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setCode("");
    setError("");
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await login(email, password);
      if (result.requireCode) {
        setView("code");
      } else {
        onOpenChange(false);
        reset();
        if (result.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const user = await verifyLoginCode(email, code);
      onOpenChange(false);
      reset();
      if (user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await register(email, password);
      toast.success("Compte cree ! Verifiez votre email pour activer votre compte.");
      setView("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Si cette adresse existe, un lien de reinitialisation a ete envoye.");
        setView("login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => onOpenChange(false)}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Login */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-xl font-bold text-center">Connexion</h2>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Se connecter
            </Button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => { reset(); setView("forgot"); }} className="text-primary hover:underline">
                Mot de passe oublie ?
              </button>
              <button type="button" onClick={() => { reset(); setView("register"); }} className="text-primary hover:underline">
                Creer un compte
              </button>
            </div>
          </form>
        )}

        {/* 2FA Code */}
        {view === "code" && (
          <form onSubmit={handleCode} className="space-y-4">
            <h2 className="text-xl font-bold text-center">Code de verification</h2>
            <p className="text-sm text-slate-500 text-center">
              Un code a 6 chiffres a ete envoye a {email}
            </p>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="code-input">Code</Label>
              <Input
                id="code-input"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                autoComplete="one-time-code"
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting || code.length !== 6}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Verifier
            </Button>
            <button type="button" onClick={() => { reset(); setView("login"); }} className="w-full text-sm text-primary hover:underline">
              Retour a la connexion
            </button>
          </form>
        )}

        {/* Register */}
        {view === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-xl font-bold text-center">Creer un compte</h2>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Mot de passe (12 caracteres min.)</Label>
              <Input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={12}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm">Confirmer le mot de passe</Label>
              <Input
                id="reg-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Creer mon compte
            </Button>
            <button type="button" onClick={() => { reset(); setView("login"); }} className="w-full text-sm text-primary hover:underline">
              Deja un compte ? Se connecter
            </button>
          </form>
        )}

        {/* Forgot password */}
        {view === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-4">
            <h2 className="text-xl font-bold text-center">Mot de passe oublie</h2>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Envoyer le lien
            </Button>
            <button type="button" onClick={() => { reset(); setView("login"); }} className="w-full text-sm text-primary hover:underline">
              Retour a la connexion
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
