"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, ShieldCheck, User, Lock, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { KOS_NAME, ADMIN_ACCOUNTS } from "@/lib/constants";
import { kosService } from "@/lib/services/kosService";
import { Tenant } from "@/types/database";
import { formatTanggalMasukPassword as utilsFormatPwd, formatDateIndo } from "@/lib/utils";

// Format Tanggal Masuk menjadi DDMMYY (misal: 15 Jan 2026 -> 150126)
function safeFormatPwd(dateStr: string): string {
  if (typeof utilsFormatPwd === "function") {
    return utilsFormatPwd(dateStr);
  }
  if (!dateStr) return "150126";
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}${month}${year}`;
  } catch {
    return "150126";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "";
  const reason = searchParams.get("reason") || "";

  const [role, setRole] = useState<"admin" | "tenant">("admin");
  const [emailOrName, setEmailOrName] = useState("");
  const [password, setPassword] = useState("");
  const [tenantsList, setTenantsList] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadTenants() {
      try {
        const data = await kosService.getTenants();
        setTenantsList(data);
      } catch (err) {
        console.error("Failed to load tenants for login", err);
      }
    }
    loadTenants();
  }, []);

  const handleRoleChange = (newRole: "admin" | "tenant") => {
    setRole(newRole);
    setErrorMsg("");
    setSuccessMsg("");
    setEmailOrName("");
    setPassword("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const inputName = emailOrName.trim();
    const inputPwd = password.trim();

    setTimeout(() => {
      setLoading(false);

      if (role === "admin") {
        // Validation: Admin Pemilik (Bapak, Ibu, Yaya, or admin@kos.com)
        const matchedAdmin = ADMIN_ACCOUNTS.find(
          (acc) =>
            acc.name.toLowerCase() === inputName.toLowerCase() &&
            acc.password === inputPwd
        );
        const isLegacyAdmin =
          inputName.toLowerCase() === "admin@kos.com" && inputPwd === "password123";

        if (matchedAdmin || isLegacyAdmin) {
          const adminDisplayName = matchedAdmin ? matchedAdmin.name : "Admin";
          setSuccessMsg(`Login Admin (${adminDisplayName}) berhasil! Mengalihkan...`);
          const targetUrl = redirectPath || "/admin";
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "kos_auth_user",
              JSON.stringify({ role: "admin", name: adminDisplayName, email: adminDisplayName })
            );
          }
          setTimeout(() => {
            router.push(targetUrl);
            router.refresh();
          }, 500);
        } else {
          setErrorMsg("Nama Admin atau Password Admin salah.");
        }
      } else {
        // Validation: Penyewa (Harus cocok PERSIS dengan Nama & Password Tanggal Masuk DDMMYY yang terdaftar)
        const matchedTenant = tenantsList.find((t) => {
          const expectedPwd = safeFormatPwd(t.entry_date || "");
          const nameMatch = t.name.toLowerCase().trim() === inputName.toLowerCase();
          const pwdMatch = inputPwd === expectedPwd;
          return nameMatch && pwdMatch;
        });

        if (matchedTenant) {
          setSuccessMsg(`Selamat datang, ${matchedTenant.name}! Mengalihkan...`);

          const targetUrl = redirectPath || "/admin/payments";
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "kos_auth_user",
              JSON.stringify({ role: "tenant", name: matchedTenant.name, email: matchedTenant.name })
            );
          }
          setTimeout(() => {
            router.push(targetUrl);
            router.refresh();
          }, 500);
        } else {
          setErrorMsg(
            "Gagal Login: Nama Penyewa atau Password Tanggal Masuk (format DDMMYY) tidak terdaftar / salah."
          );
        }
      }
    }, 500);
  };

  return (
    <div className="bg-latte rounded-3xl p-6 border border-cocoa/15 shadow-card space-y-5 my-2">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex p-3 bg-caramel/20 text-coffee rounded-2xl mb-1">
          <Home className="w-6 h-6" />
        </div>
        <h1 className="font-serif font-bold text-xl text-espresso">
          Portal Login Gateway
        </h1>
        <p className="text-cocoa text-xs">
          Masuk ke portal {KOS_NAME}
        </p>
      </div>

      {/* Redirect Alert Warning */}
      {reason && (
        <div className="flex items-start gap-2 p-3 bg-status-danger/15 text-status-danger rounded-2xl text-xs font-semibold border border-status-danger/30">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {reason === "admin_required"
              ? "Silakan login sebagai Admin Pemilik untuk mengakses Halaman Admin."
              : "Silakan login (Admin atau Penyewa) untuk mengakses Log."}
          </span>
        </div>
      )}

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-1.5 bg-cream p-1 rounded-2xl border border-cocoa/15">
        <button
          type="button"
          onClick={() => handleRoleChange("admin")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            role === "admin"
              ? "bg-coffee text-white shadow-xs"
              : "text-espresso/70 hover:text-espresso"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-caramel" />
          Admin Pemilik
        </button>
        <button
          type="button"
          onClick={() => handleRoleChange("tenant")}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            role === "tenant"
              ? "bg-coffee text-white shadow-xs"
              : "text-espresso/70 hover:text-espresso"
          }`}
        >
          <User className="w-3.5 h-3.5 text-caramel" />
          Penyewa
        </button>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-espresso mb-1">
            {role === "admin" ? "Nama Admin" : "Nama Lengkap Penyewa"}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-cocoa absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={emailOrName}
              onChange={(e) => setEmailOrName(e.target.value)}
              placeholder={role === "admin" ? "Contoh: Bapak / Ibu / Yaya" : "Contoh: Budi Santoso"}
              className="w-full pl-10 pr-4 py-2.5 bg-cream rounded-2xl border border-cocoa/20 text-xs text-espresso focus:outline-none focus:border-coffee"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-espresso mb-1">
            {role === "admin" ? "Password Admin" : "Password Tanggal Masuk (Format DDMMYY)"}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-cocoa absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={role === "admin" ? "••••••••" : "Contoh: 150126 (15 Jan 2026)"}
              className="w-full pl-10 pr-4 py-2.5 bg-cream rounded-2xl border border-cocoa/20 text-xs font-mono font-bold text-coffee focus:outline-none focus:border-coffee"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-status-danger/15 text-status-danger rounded-2xl text-xs font-semibold border border-status-danger/30">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-2.5 bg-status-success/15 text-status-success rounded-2xl text-xs font-semibold">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-coffee hover:bg-coffee-dark text-white font-bold rounded-2xl shadow-xs transition-all text-xs active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <span>Memproses...</span>
          ) : (
            <>
              <span>Masuk Portal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-cocoa">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
