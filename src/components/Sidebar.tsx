"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import {
  Home,
  User2,
  CalendarClock,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";

type SidebarProps = {
  collapsed: boolean;
};

export default function Sidebar({ collapsed }: SidebarProps) {
  const router = useRouter();
  const [view, setView] = useState<"main" | "settings">("main");

  return (
    <aside
      className={`flex h-screen shrink-0 ${
        collapsed ? "w-16" : "w-64"
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
            className={`flex h-full transition-transform duration-300 ${
              view === "settings" ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            {/* ================= MAIN MENU ================= */}
            <div className="w-full shrink-0 px-2 py-4 space-y-1">
              <Link
                href="/"
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                  router.pathname === "/"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Home className="h-5 w-5" />
                {!collapsed && "Dashboard"}
              </Link>

              <Link
                href="/account-master"
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                  router.pathname === "/account-master"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <CalendarClock className="h-5 w-5" />
                {!collapsed && "Account Master"}
              </Link>

              <Link
                href="/leads"
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                  router.pathname === "/leads"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <User2 className="h-5 w-5" />
                {!collapsed && "Leads"}
              </Link>

              {/* Settings Button */}
              <button
                onClick={() => setView("settings")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                <Settings className="h-5 w-5" />
                {!collapsed && "Settings"}
              </button>
            </div>

            {/* ================= SETTINGS VIEW ================= */}
            <div className="w-full shrink-0 px-2 py-4 space-y-1">
              
              {/* Back Button */}
              <button
                onClick={() => setView("main")}
                className="flex items-center gap-2 text-white px-3 py-2 mb-3"
              >
                <ArrowLeft className="h-4 w-4" />
                {!collapsed && "Back"}
              </button>

              <Link
                href="/settings/staff"
                className="block rounded-xl px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                Staff
              </Link>

              <Link
                href="/settings/inquiry-category"
                className="block rounded-xl px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                Inquiry Category
              </Link>

              <Link
                href="/settings/lead-status"
                className="block rounded-xl px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                Lead Status
              </Link>

              <Link
                href="/settings/module-suggestion"
                className="block rounded-xl px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                Module Suggestion
              </Link>
            </div>
          </div>
        </div>

        {/* ===== Profile ===== */}
        <div className="mt-auto border-t border-white/10 px-3 py-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
              A
            </div>

            {!collapsed && (
              <div>
                <div className="text-sm font-medium text-white">
                  Alex Rivera
                </div>
                <div className="text-xs text-slate-300">
                  Sales Lead
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
