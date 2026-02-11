import { Geist, Geist_Mono } from "next/font/google";
import SummaryCard from "@/components/SummaryCard";
import { Users, UserCheck, Trophy, XCircle } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className={`${geistSans.className} ${geistMono.className}`}>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Leads" value={128} Icon={Users} />
        <SummaryCard title="Active Leads" value={56} Icon={UserCheck} />
        <SummaryCard title="Won Deals" value={32} Icon={Trophy} />
        <SummaryCard title="Lost Deals" value={12} Icon={XCircle} />
      </section>
    </div>
  );
}
