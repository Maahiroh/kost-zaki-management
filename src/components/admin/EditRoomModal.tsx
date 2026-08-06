"use client";

import { useState } from "react";
import { Room } from "@/types/database";
import { kosService } from "@/lib/services/kosService";
import { X, Edit3, DollarSign, BedDouble, Layers } from "lucide-react";

interface EditRoomModalProps {
  room: Room;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditRoomModal({
  room,
  onClose,
  onSuccess,
}: EditRoomModalProps) {
  const [roomNumber, setRoomNumber] = useState(room.room_number);
  const [priceMonthly, setPriceMonthly] = useState(room.price_monthly.toString());
  const [floor, setFloor] = useState((room.floor || 1).toString());
  const [type, setType] = useState(room.type || "Standard AC");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(priceMonthly, 10);
    const floorNum = parseInt(floor, 10);

    if (isNaN(price) || price <= 0) {
      setErrorMsg("Masukkan harga sewa yang valid.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await kosService.updateRoom({
        id: room.id,
        room_number: roomNumber,
        price_monthly: price,
        floor: floorNum,
        type,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to update room", err);
      setErrorMsg(err.message || "Gagal memperbarui data kamar.");
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
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-espresso">
                Edit Data Kamar {room.room_number}
              </h2>
              <p className="text-[11px] text-cocoa">Ubah harga sewa & spesifikasi kamar</p>
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
          {/* Room Number */}
          <div>
            <label className="block text-xs font-semibold text-espresso mb-1">
              Nomor Kamar *
            </label>
            <div className="relative">
              <BedDouble className="w-4 h-4 text-cocoa absolute left-3.5 top-2.5" />
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="101"
                className="w-full pl-10 pr-3.5 py-2.5 bg-cream rounded-2xl border border-cocoa/20 text-xs font-bold text-espresso focus:outline-none focus:border-coffee"
              />
            </div>
          </div>

          {/* Monthly Price */}
          <div>
            <label className="block text-xs font-semibold text-espresso mb-1">
              Harga Sewa per Bulan (Rp) *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-cocoa absolute left-3.5 top-2.5" />
              <input
                type="number"
                required
                step="50000"
                value={priceMonthly}
                onChange={(e) => setPriceMonthly(e.target.value)}
                placeholder="1500000"
                className="w-full pl-10 pr-3.5 py-2.5 bg-cream rounded-2xl border border-cocoa/20 text-xs font-mono font-bold text-coffee focus:outline-none focus:border-coffee"
              />
            </div>
            <p className="text-[10px] text-cocoa mt-1">
              Perubahan harga akan otomatis berlaku untuk hitungan tagihan sewa berikutnya.
            </p>
          </div>

          {/* Floor & Type Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-espresso mb-1">
                Lantai *
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-cocoa absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  required
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-cream rounded-2xl border border-cocoa/20 text-xs font-semibold text-espresso focus:outline-none focus:border-coffee"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-espresso mb-1">
                Tipe Kamar
              </label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Standard AC"
                className="w-full px-3 py-2.5 bg-cream rounded-2xl border border-cocoa/20 text-xs text-espresso focus:outline-none focus:border-coffee"
              />
            </div>
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
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
