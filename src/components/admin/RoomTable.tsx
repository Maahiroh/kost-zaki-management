"use client";

import { useState } from "react";
import { Room, Tenant } from "@/types/database";
import CountdownBadge from "./CountdownBadge";
import RoomDetailModal from "./RoomDetailModal";
import { formatWhatsAppLink, formatDateIndo, formatRupiah, hitungSisaHari } from "@/lib/utils";
import {
  MessageCircle,
  UserPlus,
  CreditCard,
  LogOut,
  CheckCircle2,
  BedDouble,
  ChevronRight,
  Edit3,
} from "lucide-react";

interface RoomTableProps {
  rooms: Room[];
  tenants: Tenant[];
  onOpenAddTenant: (roomId?: string) => void;
  onOpenPayment: (tenantId?: string) => void;
  onCheckoutTenant: (tenantId: string, roomId: string) => void;
  onOpenEditRoom: (room: Room) => void;
}

export default function RoomTable({
  rooms,
  tenants,
  onOpenAddTenant,
  onOpenPayment,
  onCheckoutTenant,
  onOpenEditRoom,
}: RoomTableProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];

  // Sorting Logic:
  // 1. Kamar Terisi di ATAS, Kamar Kosong di BAWAH
  // 2. Untuk Kamar Terisi: Diurutkan berdasarkan sisa countdown HARI terkecil (paling mendesak di paling atas)
  const sortedRooms = [...safeRooms].sort((a, b) => {
    const isOccupiedA = a.status === "Terisi";
    const isOccupiedB = b.status === "Terisi";

    if (isOccupiedA && !isOccupiedB) return -1;
    if (!isOccupiedA && isOccupiedB) return 1;

    if (isOccupiedA && isOccupiedB) {
      const tenantA = safeTenants.find((t) => t.room_id === a.id);
      const tenantB = safeTenants.find((t) => t.room_id === b.id);

      const daysA = tenantA ? hitungSisaHari(tenantA.expiry_date).days : 99999;
      const daysB = tenantB ? hitungSisaHari(tenantB.expiry_date).days : 99999;

      return daysA - daysB;
    }

    return (a.room_number || "").localeCompare(b.room_number || "", undefined, { numeric: true });
  });

  const selectedTenant = selectedRoom
    ? safeTenants.find((t) => t.room_id === selectedRoom.id)
    : undefined;

  return (
    <div className="space-y-4">
      {/* Minimalist Mobile List (< md) */}
      <div className="space-y-2 md:hidden">
        <div className="text-[11px] font-semibold text-cocoa px-1 flex items-center justify-between">
          <span>Daftar Kamar ({rooms.length})</span>
          <span className="text-coffee font-medium">Ketuk untuk detail & aksi</span>
        </div>

        {sortedRooms.map((room) => {
          const tenant = safeTenants.find((t) => t.room_id === room.id);
          const isOccupied = room.status === "Terisi" && tenant;

          return (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className="bg-latte p-3.5 rounded-2xl border border-cocoa/15 shadow-card flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
            >
              {/* Left: Room Icon, Number, & Tenant Name */}
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-2xl ${
                    isOccupied
                      ? "bg-status-danger/10 text-status-danger"
                      : "bg-status-success/10 text-status-success"
                  }`}
                >
                  <BedDouble className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-espresso">
                      Kamar {room.room_number}
                    </h3>
                    <span className="text-[10px] text-cocoa font-normal">
                      Lt {room.floor || 1}
                    </span>
                  </div>

                  <span className="text-xs text-cocoa font-medium block mt-0.5">
                    {isOccupied ? tenant.name : "Kosong (Tersedia)"}
                  </span>
                </div>
              </div>

              {/* Right: Countdown Badge & Chevron */}
              <div className="flex items-center gap-2">
                {isOccupied ? (
                  <CountdownBadge expiryDate={tenant.expiry_date} />
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-status-success/15 text-status-success rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Kosong
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-cocoa/50" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block bg-latte rounded-3xl border border-cocoa/20 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-coffee text-cream text-xs uppercase tracking-wider font-semibold border-b border-cocoa/30">
                <th className="py-4 px-6">Nomor Kamar</th>
                <th className="py-4 px-6">Penyewa Saat Ini</th>
                <th className="py-4 px-6">Countdown (Terkecil di Atas)</th>
                <th className="py-4 px-6">Kontak WA</th>
                <th className="py-4 px-6 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa/15 text-sm text-espresso">
              {sortedRooms.map((room) => {
                const tenant = safeTenants.find((t) => t.room_id === room.id);
                const isOccupied = room.status === "Terisi" && tenant;

                return (
                  <tr
                    key={room.id}
                    className="hover:bg-cream/60 transition-colors"
                  >
                    <td className="py-4 px-6 font-bold font-serif text-lg text-espresso">
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-5 h-5 text-caramel" />
                        <span>Kamar {room.room_number}</span>
                      </div>
                      <span className="text-xs text-cocoa font-sans font-normal block">
                        Lantai {room.floor || 1} • {room.type || "Standard"}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-semibold">
                      {isOccupied ? (
                        <div>
                          <span className="text-espresso font-bold block">{tenant.name}</span>
                          <span className="text-[11px] text-cocoa font-normal">
                            Jatuh Tempo: {formatDateIndo(tenant.expiry_date)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-cocoa/60 text-xs italic">- Belum ada penyewa -</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {isOccupied ? (
                        <CountdownBadge expiryDate={tenant.expiry_date} />
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-status-success/15 text-status-success rounded-full text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Kosong
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {isOccupied ? (
                        <a
                          href={formatWhatsAppLink(tenant.whatsapp_number)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/15 text-[#128C7E] hover:bg-[#25D366] hover:text-white border border-[#25D366]/40 rounded-xl text-xs font-bold transition-all shadow-sm group"
                        >
                          <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-white" />
                          <span>Chat WA</span>
                        </a>
                      ) : (
                        <span className="text-cocoa/50 text-xs">-</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEditRoom(room)}
                          className="p-2 text-coffee hover:bg-caramel/20 rounded-xl transition-colors"
                          title="Edit Harga & Data Kamar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {isOccupied ? (
                          <>
                            <button
                              onClick={() => onOpenPayment(tenant.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-coffee text-cream hover:bg-coffee-dark rounded-xl text-xs font-semibold shadow-sm transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-caramel" />
                              <span>Bayar</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin check-out penyewa ${tenant.name}?`)) {
                                  onCheckoutTenant(tenant.id, room.id);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-status-danger/10 text-status-danger hover:bg-status-danger hover:text-white rounded-xl text-xs font-semibold transition-colors"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onOpenAddTenant(room.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-caramel text-espresso hover:bg-caramel-dark font-bold rounded-xl text-xs shadow-sm transition-all"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Check-in</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Bottom Sheet Modal for Mobile */}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          tenant={selectedTenant}
          onClose={() => setSelectedRoom(null)}
          onOpenAddTenant={onOpenAddTenant}
          onOpenPayment={onOpenPayment}
          onCheckoutTenant={onCheckoutTenant}
          onOpenEditRoom={onOpenEditRoom}
        />
      )}
    </div>
  );
}
