"use client";

import { Room, Tenant } from "@/types/database";
import CountdownBadge from "./CountdownBadge";
import { formatWhatsAppLink, formatDateIndo, formatRupiah } from "@/lib/utils";
import {
  X,
  MessageCircle,
  UserPlus,
  CreditCard,
  LogOut,
  BedDouble,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Edit3,
  User,
} from "lucide-react";

interface RoomDetailModalProps {
  room: Room;
  tenant?: Tenant;
  onClose: () => void;
  onOpenAddTenant: (roomId: string) => void;
  onOpenPayment: (tenantId: string) => void;
  onCheckoutTenant: (tenantId: string, roomId: string) => void;
  onOpenEditRoom: (room: Room) => void;
}

export default function RoomDetailModal({
  room,
  tenant,
  onClose,
  onOpenAddTenant,
  onOpenPayment,
  onCheckoutTenant,
  onOpenEditRoom,
}: RoomDetailModalProps) {
  const isOccupied = room.status === "Terisi" && tenant;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-espresso/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-latte rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full border border-cocoa/20 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto mb-14 sm:mb-0 pb-8 sm:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cocoa/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-caramel/25 text-coffee rounded-2xl">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-espresso">
                Kamar {room.room_number}
              </h2>
              <span className="text-xs text-cocoa">
                Lantai {room.floor || 1} • {room.type || "Standard AC"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Edit Icon */}
            <button
              onClick={() => {
                onClose();
                onOpenEditRoom(room);
              }}
              className="p-2 text-coffee bg-caramel/20 hover:bg-caramel/40 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
              title="Edit Data/Harga Kamar"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-cocoa hover:text-espresso rounded-xl hover:bg-cream"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status & Price Card */}
        <div className="flex items-center justify-between p-3.5 bg-cream/70 rounded-2xl border border-cocoa/15">
          <div>
            <span className="text-[10px] text-cocoa block uppercase">Status Kamar</span>
            {isOccupied ? (
              <span className="inline-flex items-center gap-1 mt-0.5 px-2.5 py-0.5 bg-status-danger/15 text-status-danger rounded-full text-xs font-bold">
                <AlertCircle className="w-3 h-3" /> Terisi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 mt-0.5 px-2.5 py-0.5 bg-status-success/15 text-status-success rounded-full text-xs font-bold">
                <CheckCircle2 className="w-3 h-3" /> Kosong
              </span>
            )}
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1">
              <span className="text-[10px] text-cocoa block uppercase">Harga Sewa</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenEditRoom(room);
                }}
                className="text-coffee hover:underline text-[10px] font-bold"
              >
                (Edit)
              </button>
            </div>
            <span className="text-sm font-bold text-coffee font-mono">
              {formatRupiah(room.price_monthly)}/bln
            </span>
          </div>
        </div>

        {/* Tenant Information Details (If Occupied) */}
        {isOccupied ? (
          <div className="p-4 bg-cream/50 rounded-2xl border border-cocoa/15 space-y-3">
            <h3 className="font-semibold text-xs text-espresso flex items-center gap-1.5 border-b border-cocoa/10 pb-2">
              <User className="w-3.5 h-3.5 text-coffee" />
              Informasi Penyewa Aktif
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-cocoa">Nama Lengkap:</span>
                <span className="font-bold text-espresso">{tenant.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-cocoa">Nomor WhatsApp:</span>
                <span className="font-mono text-espresso">{tenant.whatsapp_number}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-cocoa">Jatuh Tempo Sewa:</span>
                <span className="font-medium text-espresso flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cocoa" />
                  {formatDateIndo(tenant.expiry_date)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-cocoa/10">
                <span className="text-cocoa">Countdown Sisa Sewa:</span>
                <CountdownBadge expiryDate={tenant.expiry_date} />
              </div>
            </div>

            {/* Direct WhatsApp Fast Response Button */}
            <a
              href={formatWhatsAppLink(tenant.whatsapp_number)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366] text-white rounded-2xl text-xs font-bold shadow-xs active:scale-95 transition-transform"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp ({tenant.whatsapp_number})</span>
            </a>
          </div>
        ) : (
          <div className="p-4 bg-cream/40 rounded-2xl text-center text-xs text-cocoa italic border border-dashed border-cocoa/20">
            Kamar saat ini sedang kosong dan siap untuk dihuni.
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          {/* Prominent Edit Room Button */}
          <button
            onClick={() => {
              onClose();
              onOpenEditRoom(room);
            }}
            className="w-full py-3 px-4 rounded-2xl bg-caramel hover:bg-caramel-dark text-espresso font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Harga & Spesifikasi Kamar</span>
          </button>

          {isOccupied ? (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenPayment(tenant.id);
                }}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-coffee text-white hover:bg-coffee-dark rounded-2xl text-xs font-bold shadow-xs active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5 text-caramel-light" />
                <span>Bayar Sewa</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Apakah Anda yakin ingin check-out penyewa ${tenant.name}?`)) {
                    onClose();
                    onCheckoutTenant(tenant.id, room.id);
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-status-danger/15 text-status-danger hover:bg-status-danger hover:text-white rounded-2xl text-xs font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Check-out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenAddTenant(room.id);
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-coffee hover:bg-coffee-dark text-white font-bold rounded-2xl text-xs shadow-xs active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Check-in Penyewa Baru</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
