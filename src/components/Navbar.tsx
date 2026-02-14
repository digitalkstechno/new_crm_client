"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/router";

function titleFromPath(pathname: string) {
  if (pathname === "/") return "Dashboard";

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
  const title = titleFromPath(router.pathname);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

      {/* User Section */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-full bg-white/10 p-2 text-white ring-1 ring-white/20 transition hover:bg-white/15"
        >
          <User className="h-5 w-5" />
        </button>

        {/* Dropdown */}
      {/* Dropdown */}
{open && (
  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-lg border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
    
    {/* Header (optional but looks premium) */}
    <div className="px-4 py-3 border-b border-gray-100">
      <p className="text-sm font-medium text-gray-700">Account</p>
      <p className="text-xs text-gray-400">Manage your account</p>
    </div>

    {/* Logout Button */}
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition rounded-b-2xl"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  </div>
)}

      </div>
    </header>
  );
}
