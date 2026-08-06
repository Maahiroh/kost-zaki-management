"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BedDouble, ShieldCheck, History } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/rooms", label: "Kamar", icon: BedDouble },
    { href: "/admin", label: "Admin", icon: ShieldCheck },
    { href: "/admin/payments", label: "Log", icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-cocoa/15 px-3 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 ${
              isActive
                ? "text-coffee font-bold scale-105"
                : "text-espresso/50 hover:text-espresso"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isActive ? "bg-caramel/25 text-coffee" : "bg-transparent"
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
