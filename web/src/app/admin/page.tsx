"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Shield, Clock } from "lucide-react";

interface DashboardData {
  totalUsers: number;
  newUsersMonth: number;
  newUsersWeek: number;
  recentAuthLogs: {
    id: string;
    email: string;
    action: string;
    ip: string | null;
    createdAt: string;
  }[];
}

interface StatsData {
  totalUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  deletedUsers: number;
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/admin/dashboard").then((r) => r.ok ? r.json() : null),
      apiFetch("/api/admin/stats").then((r) => r.ok ? r.json() : null),
    ]).then(([d, s]) => {
      setDashboard(d);
      setStats(s);
    });
  }, []);

  const actionLabels: Record<string, string> = {
    LOGIN_SUCCESS: "Connexion",
    LOGIN_FAILURE: "Echec connexion",
    LOGIN_FAILURE_DELETED: "Compte desactive",
    LOGIN_FAILURE_UNVERIFIED: "Email non verifie",
    LOGIN_CODE_SENT: "Code 2FA envoye",
    LOGIN_CODE_FAILURE: "Code 2FA invalide",
    REGISTER: "Inscription",
    LOGOUT: "Deconnexion",
    PASSWORD_RESET: "Reinit. mot de passe",
    PASSWORD_CHANGE: "Changement mot de passe",
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1200px]">
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">Vue d'ensemble des utilisateurs</p>
      </div>

      {!stats || !dashboard ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Total utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Email verifies</CardTitle>
                <UserCheck className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Administrateurs</CardTitle>
                <Shield className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adminUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Nouveaux (7j)</CardTitle>
                <Clock className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard.newUsersWeek}</div>
                <p className="text-xs text-slate-500 mt-1">{dashboard.newUsersMonth} ce mois</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Auth Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activite recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-slate-500">Email</th>
                      <th className="pb-2 font-medium text-slate-500">Action</th>
                      <th className="pb-2 font-medium text-slate-500">IP</th>
                      <th className="pb-2 font-medium text-slate-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentAuthLogs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0">
                        <td className="py-2 font-mono text-xs">{log.email}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            log.action.includes("FAILURE") ? "bg-red-100 text-red-700" :
                            log.action === "LOGIN_SUCCESS" ? "bg-green-100 text-green-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {actionLabels[log.action] || log.action}
                          </span>
                        </td>
                        <td className="py-2 font-mono text-xs text-slate-500">{log.ip || "—"}</td>
                        <td className="py-2 text-xs text-slate-500">
                          {new Date(log.createdAt).toLocaleString("fr-FR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
