"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "@/utils/axiosInstance";
import { baseUrl } from "../../config";

function titleFromPath(pathname: string, leadName?: string) {
  if (pathname === "/") return "Dashboard";

  // Handle lead-details with dynamic name
  if (pathname.includes("/lead-details/") && leadName) {
    return `Lead Details > ${leadName}`;
  }

  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment
        .split("-")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ")
    )
    .join(" > ");
}

export default function Navbar() {
  const router = useRouter();
  const [leadName, setLeadName] = useState<string>();

  useEffect(() => {
    if (router.pathname.includes("/lead-details/") && router.query.id) {
      api.get(`${baseUrl.LEAD}/${router.query.id}`)
        .then(res => {
          const companyName = res.data.data?.accountMaster?.companyName;
          if (companyName) setLeadName(companyName);
        })
        .catch(() => {});
    }
  }, [router.pathname, router.query.id]);

  const title = titleFromPath(router.pathname, leadName);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("crm:rememberEmail");
    localStorage.clear();
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 shadow-lg ring-1 ring-white/10">
      
      {/* Title */}
      <h1 className="text-lg font-semibold text-white">
        {title}
      </h1>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-2 py-2 text-sm font-medium text-white shadow-lg ring-2 ring-red-500/50 transition hover:from-red-700 hover:to-red-800 hover:shadow-xl hover:ring-red-400/60"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </header>
  );
}
