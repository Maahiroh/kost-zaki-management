"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { kosService } from "@/lib/services/kosService";
import { ActivityLog, Tenant } from "@/types/database";
import ActivityLogFeed from "@/components/admin/ActivityLogFeed";
import PaymentFormModal from "@/components/admin/PaymentFormModal";
import CountdownBadge from "@/components/admin/CountdownBadge";
import WifiCard from "@/components/admin/WifiCard";
import QrisModal from "@/components/admin/QrisModal";
import { formatRupiah, formatDateIndo, formatWhatsAppLink } from "@/lib/utils";
import {
  Receipt,
  CreditCard,
  RefreshCw,
  ArrowLeft,
  Calendar,
  ShieldAlert,
  User,
  ShieldCheck,
  Clock,
  MessageCircle,
  QrCode,
} from "lucide-react";
import Link from "next/link";

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "tenant" | "">("");
  const [userName, setUserName] = useState<string>("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);

  // Filter States
  const [typeFilter, setTypeFilter] = useState<"semua" | "pembayaran" | "keluar_masuk">("semua");

  // Default Filter Periode untuk Admin: "semua" agar SEMUA data log langsung tampil tanpa tersembunyi
  const [semesterFilter, setSemesterFilter] = useState<"sem1" | "sem2" | "semua">("semua");

  // WhatsApp Links (Direct without chat template)
  const admin1Link = formatWhatsAppLink("087839640888");
  const admin2Link = formatWhatsAppLink("089657466665");

  // Auth Guard: Admin or Tenant Protection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("kos_auth_user");
      if (data) {
        try {
          const user = JSON.parse(data);
          if (user.role === "admin" || user.role === "tenant") {
            setAuthorized(true);
            setUserRole(user.role);
            setUserName(user.email || "");
            return;
          }
        } catch {
          // Invalid session
        }
      }
      router.push("/login?redirect=/admin/payments&reason=auth_required");
    }
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, tenantsData] = await Promise.all([
        kosService.getActivityLogs(),
        kosService.getTenants(),
      ]);
      setLogs(logsData || []);
      setTenants(tenantsData || []);
    } catch (err) {
      console.error("Failed to load activity logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      loadData();
    }
  }, [authorized]);

  if (!authorized) {
    return (
      <div className="text-center py-20 bg-latte rounded-3xl border border-cocoa/15 p-6 space-y-3 shadow-card my-4">
        <ShieldAlert className="w-10 h-10 text-coffee mx-auto animate-pulse" />
        <h2 className="font-serif font-bold text-lg text-espresso">Akses Terbatas</h2>
        <p className="text-cocoa text-xs">
          Halaman Log hanya dapat diakses setelah login (Admin atau Penyewa). Mengalihkan ke portal login...
        </p>
      </div>
    );
  }

  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];

  // Find active tenant object for tenant view with robust fallback
  let currentTenantObj = userRole === "tenant"
    ? safeTenants.find((t) => {
        const tName = (t.name || "").toLowerCase().trim();
        const uName = (userName || "").toLowerCase().trim();
        return tName === uName || tName.includes(uName) || uName.includes(tName);
      })
    : undefined;

  // Fallback tenant if loading or exact match delayed
  if (userRole === "tenant" && !currentTenantObj && userName) {
    currentTenantObj = {
      id: "tenant-fallback",
      room_id: "room-101",
      name: userName,
      whatsapp_number: "081234567890",
      entry_date: "2026-01-15T00:00:00.000Z",
      expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      room: {
        id: "room-101",
        room_number: "101",
        status: "Terisi",
        price_monthly: 750000,
        floor: 1,
        type: "Standard",
      },
    };
  }

  // Log Filtering Logic (Safe Null Checks)
  const filteredLogs = safeLogs.filter((log) => {
    if (!log) return false;

    if (userRole === "tenant" && userName) {
      const logTenantName = (log.tenant_name || "").toLowerCase().trim();
      const targetUserName = (userName || "").toLowerCase().trim();

      const isMine =
        logTenantName === targetUserName ||
        logTenantName.includes(targetUserName) ||
        targetUserName.includes(logTenantName);

      if (!isMine) return false;
    } else if (userRole === "admin") {
      if (log.date) {
        const logDate = new Date(log.date);
        const month = logDate.getMonth();

        if (semesterFilter === "sem1") {
          if (month > 5) return false;
        } else if (semesterFilter === "sem2") {
          if (month < 6) return false;
        }
      }

      if (typeFilter === "pembayaran") return log.type === "pembayaran";
      if (typeFilter === "keluar_masuk") return log.type === "check_in" || log.type === "check_out";
    }

    return true;
  });

  const periodRevenue = filteredLogs
    .filter((l) => l && l.type === "pembayaran" && l.amount)
    .reduce((sum, l) => sum + (l.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* App Header Card */}
      <div className="bg-latte rounded-3xl p-4 sm:p-5 border border-cocoa/15 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[11px] text-cocoa hover:text-coffee font-semibold mb-0.5 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Kembali Ke Beranda
            </Link>
            <h1 className="font-serif font-bold text-xl text-espresso flex items-center gap-1.5">
              <Receipt className="w-5 h-5 text-coffee" />
              {userRole === "admin" ? "Log Aktivitas Kos" : "Log Riwayat Sewa"}
            </h1>
          </div>

          <button
            onClick={loadData}
            className="p-2 bg-cream hover:bg-cocoa/15 text-espresso rounded-xl border border-cocoa/20 active:scale-95 transition-all"
            title="Refresh Log"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-coffee ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        {/* User Role & Identity Badge */}
        <div className="flex items-center justify-between p-2.5 bg-cream/70 rounded-2xl border border-cocoa/15 text-xs">
          <div className="flex items-center gap-1.5">
            {userRole === "admin" ? (
              <ShieldCheck className="w-4 h-4 text-coffee" />
            ) : (
              <User className="w-4 h-4 text-caramel-dark" />
            )}
            <span className="font-bold text-espresso">
              {userRole === "admin" ? "Mode Admin (Semua Log Kos)" : `Penyewa: ${userName}`}
            </span>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 bg-caramel/20 text-coffee rounded-full">
            {userRole === "admin" ? "Full Access" : "Data Pribadi"}
          </span>
        </div>

        {/* Informasional Wi-Fi Card (Dibawah "Penyewa:..." dan diatas "Jatuh Tempo") */}
        <WifiCard isAdmin={userRole === "admin"} />

        {/* Button Pembayaran QRIS untuk Admin (Dibawah Fasilitas Wi-Fi) */}
        {userRole === "admin" && (
          <button
            onClick={() => setIsQrisModalOpen(true)}
            className="w-full py-2.5 px-3 bg-cream hover:bg-caramel/20 border border-cocoa/20 text-espresso rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-coffee text-white rounded-xl">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold text-xs block text-espresso">Pembayaran QRIS</span>
                <span className="text-[10px] text-cocoa">Lihat & ubah gambar QRIS kos</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-coffee text-white text-[11px] font-bold rounded-xl shadow-2xs">
              Kelola QRIS
            </span>
          </button>
        )}

        {/* TENANT PROMINENT DUE DATE CARD (Judul "Jatuh Tempo") */}
        {userRole === "tenant" && currentTenantObj && (
          <div className="p-4 bg-gradient-to-br from-cream via-latte to-caramel/20 rounded-2xl border border-caramel/40 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cocoa flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-coffee" />
                Jatuh Tempo
              </span>
              <span className="text-xs font-bold text-coffee bg-caramel/30 px-2.5 py-0.5 rounded-full">
                Kamar {currentTenantObj.room?.room_number || currentTenantObj.room_id}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
              <div>
                <span className="text-xl sm:text-2xl font-serif font-extrabold text-espresso tracking-tight block">
                  {formatDateIndo(currentTenantObj.expiry_date)}
                </span>
                <span className="text-[10px] text-cocoa">
                  Pastikan pembayaran dilakukan sebelum jatuh tempo
                </span>
              </div>

              <div className="shrink-0">
                <CountdownBadge expiryDate={currentTenantObj.expiry_date} />
              </div>
            </div>
          </div>
        )}

        {/* Date Semester Settings (Tampil HANYA untuk Admin) */}
        {userRole === "admin" && (
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-semibold text-cocoa flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-caramel" />
              Setting Periode Log (6 Bulan):
            </label>
            <div className="grid grid-cols-3 gap-1 bg-cream p-1 rounded-2xl border border-cocoa/15 text-xs font-semibold">
              <button
                onClick={() => setSemesterFilter("sem1")}
                className={`py-1.5 px-2 rounded-xl text-[11px] transition-all ${
                  semesterFilter === "sem1"
                    ? "bg-coffee text-white shadow-xs"
                    : "text-espresso/70 hover:text-espresso"
                }`}
              >
                Jan - Jun
              </button>

              <button
                onClick={() => setSemesterFilter("sem2")}
                className={`py-1.5 px-2 rounded-xl text-[11px] transition-all ${
                  semesterFilter === "sem2"
                    ? "bg-coffee text-white shadow-xs"
                    : "text-espresso/70 hover:text-espresso"
                }`}
              >
                Jul - Des
              </button>

              <button
                onClick={() => setSemesterFilter("semua")}
                className={`py-1.5 px-2 rounded-xl text-[11px] transition-all ${
                  semesterFilter === "semua"
                    ? "bg-coffee text-white shadow-xs"
                    : "text-espresso/70 hover:text-espresso"
                }`}
              >
                Semua
              </button>
            </div>
          </div>
        )}

        {/* Type Filter Tabs (Tampil HANYA untuk Admin) */}
        {userRole === "admin" && (
          <div className="flex items-center gap-1 bg-cream p-1 rounded-2xl border border-cocoa/15">
            <button
              onClick={() => setTypeFilter("semua")}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                typeFilter === "semua"
                  ? "bg-caramel text-espresso font-bold shadow-xs"
                  : "text-espresso/70 hover:text-espresso"
              }`}
            >
              Semua Log
            </button>
            <button
              onClick={() => setTypeFilter("pembayaran")}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                typeFilter === "pembayaran"
                  ? "bg-status-success text-white shadow-xs"
                  : "text-status-success hover:bg-status-success/10"
              }`}
            >
              Pembayaran
            </button>
            <button
              onClick={() => setTypeFilter("keluar_masuk")}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                typeFilter === "keluar_masuk"
                  ? "bg-coffee text-white shadow-xs"
                  : "text-coffee hover:bg-coffee/10"
              }`}
            >
              Keluar/Masuk
            </button>
          </div>
        )}

        {/* ADMIN Summary Pill & Add Payment Button */}
        {userRole === "admin" ? (
          <div className="flex items-center justify-between pt-1 text-xs">
            <div>
              <span className="text-[10px] text-cocoa block">
                {semesterFilter === "sem1"
                  ? "Total Terbayar (Jan - Jun)"
                  : semesterFilter === "sem2"
                  ? "Total Terbayar (Jul - Des)"
                  : "Total Terbayar Keseluruhan"}
              </span>
              <span className="font-mono font-bold text-coffee text-sm">
                {formatRupiah(periodRevenue)}
              </span>
            </div>

            <button
              onClick={() => setIsPaymentOpen(true)}
              className="inline-flex items-center gap-1.5 py-2 px-3 bg-coffee hover:bg-coffee-dark text-white font-bold rounded-2xl text-xs shadow-xs active:scale-95 transition-all"
            >
              <CreditCard className="w-3.5 h-3.5 text-caramel-light" />
              + Bayar
            </button>
          </div>
        ) : (
          /* TENANT 2 WhatsApp Contact Buttons (Pengganti "Total Pembayaran Saya") */
          <div className="pt-1 space-y-1.5">
            <span className="text-[10px] font-semibold text-cocoa block">
              Konfirmasi Pembayaran / Pertanyaan:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={admin1Link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#128C7E] rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Admin 1</span>
              </a>

              <a
                href={admin2Link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#128C7E] rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Admin 2</span>
              </a>
            </div>

            {/* Button Pembayaran QRIS untuk Penyewa (Dibawah Konfirmasi Pembayaran) */}
            <div className="pt-2 border-t border-cocoa/10">
              <button
                onClick={() => setIsQrisModalOpen(true)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-coffee via-coffee-dark to-espresso text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
              >
                <QrCode className="w-4 h-4 text-caramel-light" />
                <span>Pembayaran QRIS (Scan & Unduh)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Activity Log Feed */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1 text-[11px] text-cocoa font-semibold">
          <span>
            {userRole === "admin"
              ? `Riwayat Seluruh Log (${filteredLogs.length})`
              : `Riwayat Log Pribadi (${filteredLogs.length})`}
          </span>
          {userRole === "admin" && (
            <span>
              {semesterFilter === "sem1"
                ? "Periode: Jan - Jun 2026"
                : semesterFilter === "sem2"
                ? "Periode: Jul - Des 2026"
                : "Semua Periode"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-latte rounded-2xl animate-pulse border border-cocoa/15" />
            ))}
          </div>
        ) : (
          <ActivityLogFeed logs={filteredLogs} />
        )}
      </section>

      {/* Payment Modal (Admin only) */}
      {isPaymentOpen && userRole === "admin" && (
        <PaymentFormModal
          tenants={tenants}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={loadData}
        />
      )}

      {/* QRIS Modal (Admin & Tenant) */}
      <QrisModal
        isOpen={isQrisModalOpen}
        isAdmin={userRole === "admin"}
        onClose={() => setIsQrisModalOpen(false)}
      />
    </div>
  );
}
