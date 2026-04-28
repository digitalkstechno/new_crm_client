import { useEffect } from "react";
import Navbar from "./Navbar";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/router";
import { getTokenData } from "@/utils/tokenHelper";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    const checkPermissionsAndRedirect = async () => {
      if (router.pathname === "/") {
        const tokenData = await getTokenData();
        if (tokenData) {
          const hasOnlySettings =
            tokenData.canAccessSettings &&
            !tokenData.canAccessDashboard &&
            !tokenData.canAccessAccountMaster &&
            !tokenData.canAccessLeads &&
            !tokenData.canAccessReports &&
            !tokenData.canAccessProduction;
          if (hasOnlySettings) router.replace("/settings/staff");
        }
      }
    };
    checkPermissionsAndRedirect();
  }, [router.pathname]);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-3">{children}</main>
      <footer className="flex-shrink-0 border-t border-gray-200 bg-white py-2 px-4">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <p>
            © 2026{" "}
            <Link
              href="https://digitalkstechno.com"
              target="_blank"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Digitalks
            </Link>
            . All rights reserved.
          </p>
          <span className="text-gray-300">•</span>
          <p>
            Designed &amp; Developed with{" "}
            <span className="text-red-500">❤️</span> by Digitalks
          </p>
        </div>
      </footer>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  );
}
