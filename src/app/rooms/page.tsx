"use client";

import { useEffect, useState } from "react";
import RoomCard from "@/components/public/RoomCard";
import { kosService } from "@/lib/services/kosService";
import { Room } from "@/types/database";
import { BedDouble, CheckCircle2, AlertCircle } from "lucide-react";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"semua" | "Kosong" | "Terisi">("semua");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await kosService.getRooms();
        setRooms(data);
      } catch (err) {
        console.error("Failed to load rooms", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredRooms = rooms.filter((r) => {
    if (filter === "semua") return true;
    return r.status === filter;
  });

  const totalKosong = rooms.filter((r) => r.status === "Kosong").length;
  const totalTerisi = rooms.filter((r) => r.status === "Terisi").length;

  return (
    <div className="space-y-4">
      {/* Mobile Header Card */}
      <div className="bg-latte rounded-3xl p-5 border border-cocoa/15 shadow-card space-y-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-coffee font-semibold text-[11px] uppercase tracking-wider mb-1">
            <BedDouble className="w-3.5 h-3.5 text-caramel" />
            Status Real-time
          </div>
          <h1 className="font-serif font-bold text-xl text-espresso">
            Ketersediaan Kamar
          </h1>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-cream p-1 rounded-2xl border border-cocoa/15">
          <button
            onClick={() => setFilter("semua")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "semua"
                ? "bg-coffee text-white shadow-xs"
                : "text-espresso/70 hover:text-espresso"
            }`}
          >
            Semua ({rooms.length})
          </button>
          <button
            onClick={() => setFilter("Kosong")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "Kosong"
                ? "bg-status-success text-white shadow-xs"
                : "text-status-success hover:bg-status-success/10"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Kosong ({totalKosong})
          </button>
          <button
            onClick={() => setFilter("Terisi")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "Terisi"
                ? "bg-status-danger text-white shadow-xs"
                : "text-status-danger hover:bg-status-danger/10"
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            Terisi ({totalTerisi})
          </button>
        </div>
      </div>

      {/* Room Cards List Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-latte rounded-3xl animate-pulse border border-cocoa/15" />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-12 bg-latte rounded-3xl border border-cocoa/15">
          <p className="text-cocoa font-medium text-sm">Tidak ada kamar dengan status ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
