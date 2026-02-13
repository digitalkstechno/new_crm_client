import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Toaster } from "react-hot-toast";

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
