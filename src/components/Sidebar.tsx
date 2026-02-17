"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User2,
  CalendarClock,
  Settings,
  ArrowLeft,
  Users,
  Shield,
  Palette,
  FolderOpen,
  Package,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

type SidebarProps = {
  collapsed: boolean;
};

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const [view, setView] = useState<"main" | "settings">("main");
  const [userRoleOpen, setUserRoleOpen] = useState(false);
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const [canAccessSettings, setCanAccessSettings] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("Role");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const settingsAccess = localStorage.getItem("canAccessSettings");
    setCanAccessSettings(settingsAccess === "true");
    
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole");
    if (name) setUserName(name);
    if (role) setUserRole(role);

    // Set view based on current pathname on mount WITHOUT animation
    if (pathname.startsWith("/settings")) {
      setView("settings");
      if (pathname === "/settings/staff" || pathname === "/settings/role") {
        setUserRoleOpen(true);
      }
      if (pathname === "/settings/customization-type" || pathname === "/settings/inquiry-category" || 
          pathname === "/settings/module-suggestion" || pathname === "/settings/client-type" || 
          pathname === "/settings/source-from") {
        setMasterDataOpen(true);
      }
    }
    
    // Enable animation after initial render
    setTimeout(() => setIsInitialized(true), 50);
  }, [pathname]);

  // 🔥 Auto switch view based on route (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    
    if (pathname.startsWith("/settings")) {
      setView("settings");
    } else {
      setView("main");
    }
  }, [pathname, isInitialized]);

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={`flex h-screen shrink-0 ${collapsed ? "w-16" : "w-64"
        } transition-all duration-300`}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-r-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-xl ring-1 ring-white/10">

        {/* ===== Logo ===== */}
        <div className="flex h-16 items-center border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1b035c] to-[#615FFF] text-white font-bold shadow-md">
              C
            </div>

            {!collapsed && (
              <div>
                <div className="text-white font-semibold">
                  CRM System
                </div>
                <div className="text-xs text-gray-400">
                  Business Dashboard
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== SLIDER CONTAINER ===== */}
        <div className="relative flex-1 overflow-hidden">
          <div
            className={`flex h-full ${isInitialized ? 'transition-transform duration-300' : ''} ${view === "settings" ? "-translate-x-full" : "translate-x-0"
              }`}
          >

            {/* ================= MAIN MENU ================= */}
            <div className="w-full shrink-0 px-2 py-4 space-y-1">

              <Link
                href="/"
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${isActive("/")
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive("/") ? "bg-blue-500" : "bg-blue-500/20"}`}>
                  <Home className="h-4 w-4 text-white" />
                </div>
                {!collapsed && "Dashboard"}
              </Link>

              <Link
                href="/account-master"
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${isActive("/account-master")
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive("/account-master") ? "bg-green-500" : "bg-green-500/20"}`}>
                  <CalendarClock className="h-4 w-4 text-white" />
                </div>
                {!collapsed && "Account Master"}
              </Link>

              <Link
                href="/leads"
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${isActive("/leads")
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive("/leads") ? "bg-purple-500" : "bg-purple-500/20"}`}>
                  <User2 className="h-4 w-4 text-white" />
                </div>
                {!collapsed && "Leads"}
              </Link>

              {/* Settings Button */}
              {canAccessSettings && (
                <button
                  onClick={() => setView("settings")}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 transition ${pathname.startsWith("/settings")
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${pathname.startsWith("/settings") ? "bg-orange-500" : "bg-orange-500/20"}`}>
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  {!collapsed && "Settings"}
                </button>
              )}
            </div>

            {/* ================= SETTINGS VIEW ================= */}
            <div className="w-full shrink-0 px-2 py-4 space-y-1">

              {/* Back Button */}
              <button
                onClick={() => setView("main")}
                className="flex items-center gap-2 text-white px-3 py-2 mb-3 hover:bg-white/5 rounded-lg transition"
              >
                <ArrowLeft className="h-4 w-4" />
                {!collapsed && "Back"}
              </button>

              <div>
                <button
                  onClick={() => {
                    setUserRoleOpen(!userRoleOpen);
                    setMasterDataOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 transition ${(pathname === "/settings/staff" || pathname === "/settings/role")
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${(pathname === "/settings/staff" || pathname === "/settings/role") ? "bg-cyan-500" : "bg-cyan-500/20"}`}>
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    {!collapsed && "User & Role"}
                  </div>
                  {!collapsed && (
                    userRoleOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {userRoleOpen && !collapsed && (
                  <div className="ml-11 mt-1 space-y-1">
                    <Link
                      href="/settings/staff"
                      className={`block rounded-lg px-3 py-2 text-sm transition ${isActive("/settings/staff")
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      User
                    </Link>
                    <Link
                      href="/settings/role"
                      className={`block rounded-lg px-3 py-2 text-sm transition ${isActive("/settings/role")
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      Role
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => {
                    setMasterDataOpen(!masterDataOpen);
                    setUserRoleOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 transition ${(
                    pathname === "/settings/customization-type" || 
                    pathname === "/settings/inquiry-category" || 
                    pathname === "/settings/module-suggestion" || 
                    pathname === "/settings/client-type" || 
                    pathname === "/settings/source-from"
                  )
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${(
                      pathname === "/settings/customization-type" || 
                      pathname === "/settings/inquiry-category" || 
                      pathname === "/settings/module-suggestion" || 
                      pathname === "/settings/client-type" || 
                      pathname === "/settings/source-from"
                    ) ? "bg-purple-500" : "bg-purple-500/20"}`}>
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    {!collapsed && "Master Data"}
                  </div>
                  {!collapsed && (
                    masterDataOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {masterDataOpen && !collapsed && (
                  <div className="ml-11 mt-1 space-y-1">
                    <Link
                      href="/settings/customization-type"
                      className={`block rounded-lg px-3 py-2 text-sm transition ${isActive("/settings/customization-type")
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      Customization Type
                    </Link>
                    <Link
                      href="/settings/inquiry-category"
                      className={`block rounded-lg px-3 py-2 text-sm transition ${isActive("/settings/inquiry-category")
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      Inquiry Category
                    </Link>
                    <Link
                      href="/settings/module-suggestion"
                      className={`block rounded-lg px-3 py-2 text-sm transition ${isActive("/settings/module-suggestion")
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      Module Suggestion
                    </Link>
                    <Link
                      href="/settings/client-type"
                      className={`block rounded-lg px-3 py-2 text-sm transition ${isActive("/settings/client-type")
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      Client Type
                    </Link>
                    <Link
                      href="/settings/source-from"
                      className={`block rounded-lg px-3 py-2 text-sm transition ${isActive("/settings/source-from")
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      Source From
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ===== Profile Section ===== */}
        <div className="mt-auto border-t border-white/10 px-3 py-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
              {userName.charAt(0).toUpperCase()}
            </div>

            {!collapsed && (
              <div>
                <div className="text-sm font-medium text-white">
                  {userName}
                </div>
                <div className="text-xs text-slate-300">
                  {userRole}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}
