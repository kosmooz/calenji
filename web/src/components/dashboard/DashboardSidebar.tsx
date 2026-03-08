"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  User,
  Pencil,
  KeyRound,
  LogOut,
  ChevronsLeft,
  Home,
  Shield,
  X,
  Calendar,
  FileText,
  Share2,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/calendrier", label: "Calendrier", icon: Calendar },
  { href: "/dashboard/publications", label: "Publications", icon: FileText },
  { href: "/dashboard/reseaux", label: "Réseaux sociaux", icon: Share2 },
  { href: "/dashboard/profile", label: "Mon profil", icon: User, separator: true },
  { href: "/dashboard/edit-profile", label: "Modifier le profil", icon: Pencil },
  { href: "/dashboard/change-password", label: "Mot de passe", icon: KeyRound },
];

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function DashboardSidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  const initials = user
    ? (user.firstName?.[0] || user.email[0]).toUpperCase() +
      (user.lastName?.[0] || "").toUpperCase()
    : "";

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email || "";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${collapsed ? "w-[52px]" : "w-60"}
          bg-[#fbfbfa] border-r border-[#e8e5e0]
          flex flex-col
          transition-all duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* User section */}
        <div className="flex items-center justify-between px-2 py-2 min-h-[46px]">
          <button
            onClick={() => navigate("/dashboard/profile")}
            className={`
              flex items-center gap-2 rounded-md px-1.5 py-1 w-full
              hover:bg-black/5 transition-colors text-left
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <div className="w-6 h-6 rounded-sm bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-semibold text-white leading-none">
                {initials}
              </span>
            </div>
            {!collapsed && (
              <span className="text-[13px] font-medium text-[#37352f] truncate">
                {displayName}
              </span>
            )}
          </button>

          {/* Collapse toggle (desktop only) */}
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded-sm hover:bg-black/5 text-[#9b9a97] transition-colors flex-shrink-0"
              title="Réduire le menu"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-6 h-6 rounded-sm hover:bg-black/5 text-[#9b9a97]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-1 py-1 space-y-px">
          {navItems.map((item: any) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <div key={item.href}>
                {item.separator && (
                  <div className="my-2 mx-2 border-t border-[#e8e5e0]" />
                )}
                <button
                  onClick={() => navigate(item.href)}
                  className={`
                    w-full flex items-center gap-2 rounded-md text-[13px] transition-colors
                    ${collapsed ? "justify-center px-2 py-1.5" : "px-2 py-1.5"}
                    ${
                      active
                        ? "bg-black/5 text-[#37352f] font-medium"
                        : "text-[#73726e] hover:bg-black/4 hover:text-[#37352f]"
                    }
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={active ? 2 : 1.8} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-1 py-2 space-y-px border-t border-[#e8e5e0]">
          {/* Home link */}
          <button
            onClick={() => navigate("/")}
            className={`
              w-full flex items-center gap-2 rounded-md text-[13px] text-[#73726e]
              hover:bg-black/4 hover:text-[#37352f] transition-colors
              ${collapsed ? "justify-center px-2 py-1.5" : "px-2 py-1.5"}
            `}
            title={collapsed ? "Accueil" : undefined}
          >
            <Home className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.8} />
            {!collapsed && <span>Accueil</span>}
          </button>

          {/* Admin link */}
          {user?.role === "ADMIN" && (
            <button
              onClick={() => navigate("/admin")}
              className={`
                w-full flex items-center gap-2 rounded-md text-[13px] text-[#73726e]
                hover:bg-black/4 hover:text-[#37352f] transition-colors
                ${collapsed ? "justify-center px-2 py-1.5" : "px-2 py-1.5"}
              `}
              title={collapsed ? "Administration" : undefined}
            >
              <Shield className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.8} />
              {!collapsed && <span>Administration</span>}
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-2 rounded-md text-[13px] text-[#73726e]
              hover:bg-black/4 hover:text-[#37352f] transition-colors
              ${collapsed ? "justify-center px-2 py-1.5" : "px-2 py-1.5"}
            `}
            title={collapsed ? "Déconnexion" : undefined}
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.8} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
