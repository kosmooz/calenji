"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Menu, ChevronsRight } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <main className="flex-1 min-w-0">
        {/* Top bar (mobile menu + collapsed expand) */}
        <div className="sticky top-0 z-30 flex items-center h-[46px] px-3 border-b border-[#e8e5e0] bg-white/80 backdrop-blur-sm">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-md hover:bg-black/5 text-[#9b9a97] transition-colors"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          {/* Collapsed expand button (desktop) */}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-black/5 text-[#9b9a97] transition-colors"
              title="Ouvrir le menu"
            >
              <ChevronsRight className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>

        {/* Page content */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
