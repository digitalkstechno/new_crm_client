"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/utils/axiosInstance";
import { baseUrl } from "../../config";
import { clearUserCache, getTokenData } from "@/utils/tokenHelper";
import {
  Home,
  User2,
  CalendarClock,
  Settings,
  FileText,
  Factory,
  LogOut,
  Users,
  Package,
  ChevronDown,
  MessageCircle
} from "lucide-react";

function getLeadTitle(pathname: string, leadName?: string) {
  if (pathname === "/") return null;
  if (pathname.includes("/lead-details/") && leadName)
    return `Lead Details › ${leadName}`;
  return pathname
    .split("/")
    .filter(Boolean)
    .map((s) =>
      s
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    )
    .join(" › ");
}

const SETTINGS_PATHS = [
  "/settings/staff",
  "/settings/role",
  "/settings/customization-type",
  "/settings/inquiry-category",
  "/settings/model-suggestion",
  "/settings/client-type",
  "/settings/source-from",
  "/settings/color",
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [tokenData, setTokenData] = useState<any>(null);
  const [leadName, setLeadName] = useState<string>();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    getTokenData(true).then(setTokenData);
  }, [pathname]);

  useEffect(() => {
    if (router.pathname.includes("/lead-details/") && router.query.id) {
      api
        .get(`${baseUrl.LEAD}/${router.query.id}`)
        .then((res) => {
          const name = res.data.data?.accountMaster?.companyName;
          if (name) setLeadName(name);
        })
        .catch(() => { });
    }
  }, [router.pathname, router.query.id]);

  // Close settings dropdown on outside click
  useEffect(() => {
    if (!settingsOpen) return;
    const close = () => setSettingsOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [settingsOpen]);

  const handleLogout = () => {
    clearUserCache();
    localStorage.clear();
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;
  const isSettingsActive = pathname.startsWith("/settings");

  const navLink = (
    href: string,
    label: string,
    Icon: React.ElementType,
    activeClass: string,
    iconActive: string,
    iconInactive: string
  ) => (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${isActive(href)
          ? `${activeClass} shadow-sm`
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
    >
      <Icon
        className={`h-4 w-4 ${isActive(href) ? iconActive : iconInactive}`}
      />
      {label}
    </Link>
  );

  const pageTitle = getLeadTitle(pathname, leadName);

  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
      <div className="relative flex h-14 items-center px-5 overflow-visible">
        {/* Logo - absolute left */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm shadow">
            M
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-gray-900 leading-tight">MOZU CRM</div>
            <div className="text-[10px] text-gray-400 leading-tight">Business Dashboard</div>
          </div>
        </div>

        {/* Nav tabs - truly centered */}
        {tokenData && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 overflow-visible">
            {tokenData.canAccessDashboard &&
              navLink("/", "Dashboard", Home, "bg-blue-50 text-blue-700", "text-blue-600", "text-blue-400")}

            {tokenData.canAccessAccountMaster &&
              navLink("/account-master", "Account Master", CalendarClock, "bg-green-50 text-green-700", "text-green-600", "text-green-400")}

            {tokenData.canAccessLeads && (
              <Link
                href="/leads?kanban=true"
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${pathname.startsWith("/leads") || pathname.startsWith("/lead-details")
                    ? "bg-purple-50 text-purple-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                <User2 className={`h-4 w-4 ${pathname.startsWith("/leads") || pathname.startsWith("/lead-details") ? "text-purple-600" : "text-purple-400"
                  }`} />
                Leads
              </Link>
            )}

            {tokenData.canAccessLeads &&
              navLink("/public-leads", "Public Leads", MessageCircle, "bg-pink-50 text-pink-700", "text-pink-600", "text-pink-400")}

            {tokenData.canAccessProduction &&
              navLink("/production", "Production", Factory, "bg-indigo-50 text-indigo-700", "text-indigo-600", "text-indigo-400")}

            {tokenData.canAccessReports &&
              navLink("/reports", "Reports", FileText, "bg-teal-50 text-teal-700", "text-teal-600", "text-teal-400")}

            {tokenData.canAccessSettings && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setSettingsOpen((v) => !v)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${isSettingsActive
                      ? "bg-orange-50 text-orange-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <Settings
                    className={`h-4 w-4 ${isSettingsActive ? "text-orange-600" : "text-orange-400"}`}
                  />
                  Settings
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${settingsOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {settingsOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-white border border-gray-200 shadow-xl z-[9999] p-2 space-y-1">
                    {/* User & Role */}
                    <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      User &amp; Role
                    </p>
                    <Link
                      href="/settings/staff"
                      onClick={() => setSettingsOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${isActive("/settings/staff")
                          ? "bg-cyan-50 text-cyan-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <Users className="h-4 w-4" /> User
                    </Link>
                    <Link
                      href="/settings/role"
                      onClick={() => setSettingsOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${isActive("/settings/role")
                          ? "bg-cyan-50 text-cyan-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <Users className="h-4 w-4" /> Role
                    </Link>

                    <div className="border-t border-gray-100 my-1" />

                    {/* Master Data */}
                    <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Master Data
                    </p>
                    {[
                      { href: "/settings/customization-type", label: "Customization Type" },
                      { href: "/settings/inquiry-category", label: "Inquiry Category" },
                      { href: "/settings/model-suggestion", label: "Model Suggestion" },
                      { href: "/settings/color", label: "Color" },
                      { href: "/settings/client-type", label: "Client Type" },
                      { href: "/settings/source-from", label: "Source From" },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setSettingsOpen(false)}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${isActive(href)
                            ? "bg-purple-50 text-purple-700 font-semibold"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                      >
                        <Package className="h-4 w-4" /> {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}


          </div>
        )}

        {/* User + Logout - absolute right */}
        <div className="absolute right-5 flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center rounded-lg bg-red-500 p-2 text-white hover:bg-red-600 transition shadow-sm"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}