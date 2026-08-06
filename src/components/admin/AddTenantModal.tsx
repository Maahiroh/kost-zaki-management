"use client";

import { useState } from "react";
import { Room } from "@/types/database";
import { DURATION_OPTIONS } from "@/lib/constants";
import { kosService } from "@/lib/services/kosService";
import { formatRupiah } from "@/lib/utils";
import { X, UserPlus, Phone, CheckCircle, Calendar } from "lucide-react";

interface AddTenantModalProps {
  rooms: Room[];
  selectedRoomId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTenantModal({
  rooms,
  selectedRoomId,
  onClose,
  onSuccess,
}: AddTenantModalProps) {
  const availableRooms = rooms.filter((r) => r.status === "Kosong" || r.id === selectedRoomId);

  const [roomId, setRoomId] = useState(selectedRoomId || availableRooms[0]?.id || "");
  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [durationMonths, setDurationMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentRoom = rooms.find((r) => r.id === roomId);
  const totalAmount = (currentRoom?.price_monthly || 1500000) * durationMonths;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !name || !whatsappNumber) {
      setErrorMsg("Mohon lengkapi semua data wajib.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await kosService.addTenant({
        room_id: roomId,
        name,
        whatsapp_number: whatsappNumber,
        duration_months: durationMonths,
        entry_date: new Date(entryDate).toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to add tenant", err);
      setErrorMsg(err.message || "Gagal menambah penyewa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-espresso/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-latte rounded-t-3xl sm:rounded-3xl p-5 max-w-md w-full border border-cocoa/20 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto mb-14 sm:mb-0 pb-8 sm:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cocoa/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-caramel/25 text-coffee rounded-2xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-espresso">
                Tambah Penyewa Baru
              </h2>
              <p className="text-[11px] text-cocoa">Check-in kamar & durasi sewa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-cocoa hover:text-espresso rounded-xl hover:bg-cream"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-status-danger/15 text-status-danger text-xs font-semibold rounded-2xl border border-status-danger/30">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Room Selector */}
          <div>
            <label className="block text-xs font-semibold text-espresso mb-1">
              Pilih Nomor Kamar *
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-cream rounded-2xl border border-cocoa/20 text-xs font-semibold text-espresso focus:outline-none focus:border-coffee"
            >
              <option value="">-- Pilih Kamar Kosong --</option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Kamar {r.room_number} ({formatRupiah(r.price_monthly)}/bln)
                </option>
              ))}
            </select>
          </div>

          {/* Tenant Name */}
          <div>
            <label className="block text-xs font-semibold text-espresso mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream rounded-2xl border border-cocoa/20 text-xs text-espresso focus:outline-none focus:border-coffee"
            />
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-xs font-semibold text-espresso mb-1">
              Nomor WhatsApp *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-cocoa absolute left-3.5 top-2.5" />
              <input
                type="tel"
                required
                placeholder="081234567890"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-cream rounded-2xl border border-cocoa/20 text-xs text-espresso focus:outline-none focus:border-coffee"
              />
            </div>
          </div>

          {/* Tanggal Masuk (Check-in) */}
          <div>
            <label className="block text-xs font-semibold text-espresso mb-1">
              Tanggal Masuk (Check-in) *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-cocoa absolute left-3.5 top-2.5" />
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-cream rounded-2xl border border-cocoa/20 text-xs font-semibold text-espresso focus:outline-none focus:border-coffee"
              />
            </div>
          </div>

          {/* Rent Duration */}
          <div>
            <label className="block text-xs font-semibold text-espresso mb-1">
              Durasi Sewa *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setDurationMonths(opt.months)}
                  className={`py-2 px-3 rounded-2xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${durationMonths === opt.months
                      ? "bg-coffee text-white border-coffee shadow-xs"
                      : "bg-cream text-espresso border-cocoa/20 hover:border-cocoa"
                    }`}
                >
                  <span>{opt.label}</span>
                  {durationMonths === opt.months && <CheckCircle className="w-3.5 h-3.5 text-caramel-light" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Calculation Card */}
          <div className="p-3.5 bg-cream/70 border border-cocoa/15 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-cocoa block">Total Tagihan Awal</span>
              <span className="text-lg font-bold text-coffee font-mono">
                {formatRupiah(totalAmount)}
              </span>
            </div>
            <span className="text-xs font-semibold text-caramel-dark">
              {durationMonths} Bulan
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-cocoa/20 text-xs font-semibold text-espresso hover:bg-cream"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-coffee hover:bg-coffee-dark text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan & Check-in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
