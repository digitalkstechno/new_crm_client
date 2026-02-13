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
    <div className="flex min-h-screen bg-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <main className="flex-1 p-4">
        <div className="mx-auto space-y-4">
          <Navbar />
          {children}
        </div>
      </main>
       <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </div>
  );
}
