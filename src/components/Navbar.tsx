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
    localStorage.removeItem("crm:rememberEmail"); // optional
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
        {open && (
          <div className="absolute right-0 mt-2 w-40 rounded-xl bg-slate-900 shadow-xl ring-1 ring-white/10">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
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
