"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, UserCheck, LogOut, ShieldCheck, User } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [authUser, setAuthUser] = useState<{ role: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("kos_auth_user");
      if (data) {
        try {
          setAuthUser(JSON.parse(data));
        } catch {
          setAuthUser(null);
        }
      } else {
        setAuthUser(null);
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("kos_auth_user");
      setAuthUser(null);
    }
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-latte/90 backdrop-blur-md border-b border-cocoa/15 px-4 py-3.5 sm:py-4 shadow-xs">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* App Title & Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2.5 bg-gradient-to-br from-caramel via-caramel-dark to-coffee text-white rounded-2xl shadow-soft group-hover:scale-105 transition-transform duration-200">
            <Home className="w-5 h-5" />
          </div>

          <div>
            {/* Baris 1: Kost Zaki (Size Lebih Besar) */}
            <span className="font-serif font-extrabold text-lg sm:text-xl bg-gradient-to-r from-espresso via-coffee to-cocoa bg-clip-text text-transparent tracking-tight block leading-tight">
              Kost Zaki
            </span>
            {/* Baris 2: Wetan Mantras (Size Lebih Kecil) */}
            <span className="text-xs font-bold text-coffee uppercase tracking-wider block mt-0.5">
              Wetan Mantras
            </span>
          </div>
        </Link>

        {/* User Login/Logout Badge */}
        {authUser ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-cream border border-cocoa/15 rounded-full text-xs shadow-2xs">
              {authUser.role === "admin" ? (
                <ShieldCheck className="w-4 h-4 text-coffee" />
              ) : (
                <User className="w-4 h-4 text-caramel-dark" />
              )}
              <span className="text-xs font-bold text-espresso capitalize">
                {authUser.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 bg-status-danger/10 text-status-danger hover:bg-status-danger hover:text-white rounded-xl text-xs transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-caramel to-caramel-dark text-espresso font-bold rounded-full text-xs shadow-xs active:scale-95 transition-transform border border-caramel-dark/20 shrink-0"
          >
            <UserCheck className="w-4 h-4 text-espresso" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </header>
  );
}
