import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Toaster } from "react-hot-toast";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="flex-shrink-0">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-shrink-0 p-4 pb-0">
          <Navbar />
        </div>
        <main className="flex-1 overflow-y-auto p-4">
          {children}
          <footer className="mt-8 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-t border-gray-200 py-3 px-4 shadow-sm rounded-lg">
            <div className="flex items-center justify-center gap-6 text-xs">
              <p className="text-gray-600">
                © 2026 <Link href="https://digitalkstechno.com" target="_blank" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Digitalks</Link>. All rights reserved.
              </p>
              <span className="text-gray-400">•</span>
              <p className="text-gray-600">
                Designed &amp; Developed with <span className="text-red-500 animate-pulse">❤️</span> by <span className="font-semibold text-gray-800">Digitalks</span>
              </p>
            </div>
          </footer>
        </main>
      </div>
       <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </div>
  );
}
