"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { kosService } from "@/lib/services/kosService";
import { Room, Tenant } from "@/types/database";
import RoomTable from "@/components/admin/RoomTable";
import AddTenantModal from "@/components/admin/AddTenantModal";
import PaymentFormModal from "@/components/admin/PaymentFormModal";
import EditRoomModal from "@/components/admin/EditRoomModal";
import {
  LayoutDashboard,
  UserPlus,
  CreditCard,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Modals state
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(undefined);

  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Auth Guard: Admin Only Protection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("kos_auth_user");
      if (data) {
        try {
          const user = JSON.parse(data);
          if (user.role === "admin") {
            setAuthorized(true);
            return;
          }
        } catch {
          // Invalid session
        }
      }
      router.push("/login?redirect=/admin&reason=admin_required");
    }
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData, tenantsData] = await Promise.all([
        kosService.getRooms(),
        kosService.getTenants(),
      ]);
      setRooms(roomsData);
      setTenants(tenantsData);
    } catch (err) {
      console.error("Failed to load admin data", err);
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
        <ShieldAlert className="w-10 h-10 text-status-danger mx-auto animate-pulse" />
        <h2 className="font-serif font-bold text-lg text-espresso">Akses Terbatas</h2>
        <p className="text-cocoa text-xs">
          Halaman Admin hanya dapat diakses oleh Pemilik Kos (Admin). Mengalihkan ke portal login...
        </p>
      </div>
    );
  }

  const handleCheckoutTenant = async (tenantId: string, roomId: string) => {
    try {
      await kosService.checkoutTenant(tenantId, roomId);
      await loadData();
    } catch (err) {
      console.error("Failed to checkout tenant", err);
    }
  };

  const totalRooms = rooms.length;
  const totalKosong = rooms.filter((r) => r.status === "Kosong").length;
  const totalTerisi = totalRooms - totalKosong;

  return (
    <div className="space-y-3.5">
      {/* Minimalist App Header Card matching Ketersediaan Kamar */}
      <div className="bg-latte rounded-3xl p-4 sm:p-5 border border-cocoa/15 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-cocoa uppercase tracking-wider block">
              Dashboard Pemilik
            </span>
            <h1 className="font-serif font-extrabold text-xl sm:text-2xl text-espresso">
              Admin Kos
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-caramel/20 text-coffee px-2.5 py-1 rounded-full font-bold">
              {totalTerisi} Terisi • {totalKosong} Kosong
            </span>

            <button
              onClick={loadData}
              className="p-1.5 bg-cream hover:bg-cocoa/15 text-espresso rounded-xl border border-cocoa/20 active:scale-95 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-coffee ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              setSelectedRoomId(undefined);
              setIsAddTenantOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-caramel hover:bg-caramel-dark text-espresso font-bold rounded-2xl text-xs shadow-xs active:scale-95 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Penyewa
          </button>

          <button
            onClick={() => {
              setSelectedTenantId(undefined);
              setIsPaymentOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-coffee hover:bg-coffee-dark text-white font-bold rounded-2xl text-xs shadow-xs active:scale-95 transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-caramel-light" />
            + Bayar
          </button>
        </div>
      </div>

      {/* Main Room Minimalist Cards Feed */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-latte rounded-2xl animate-pulse border border-cocoa/15" />
          ))}
        </div>
      ) : (
        <RoomTable
          rooms={rooms}
          tenants={tenants}
          onOpenAddTenant={(roomId) => {
            setSelectedRoomId(roomId);
            setIsAddTenantOpen(true);
          }}
          onOpenPayment={(tenantId) => {
            setSelectedTenantId(tenantId);
            setIsPaymentOpen(true);
          }}
          onCheckoutTenant={handleCheckoutTenant}
          onOpenEditRoom={(room) => setEditingRoom(room)}
        />
      )}

      {/* Modals */}
      {isAddTenantOpen && (
        <AddTenantModal
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onClose={() => setIsAddTenantOpen(false)}
          onSuccess={loadData}
        />
      )}

      {isPaymentOpen && (
        <PaymentFormModal
          tenants={tenants}
          selectedTenantId={selectedTenantId}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={loadData}
        />
      )}

      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
