import { Room } from "@/types/database";
import { formatRupiah } from "@/lib/utils";
import { CheckCircle2, AlertCircle, BedDouble, MessageCircle } from "lucide-react";
import Link from "next/link";

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const isAvailable = room.status === "Kosong";

  return (
    <div className="bg-latte rounded-3xl p-4 sm:p-5 border border-cocoa/15 shadow-card hover:border-caramel/40 transition-all space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-2xl ${
              isAvailable
                ? "bg-status-success/15 text-status-success"
                : "bg-status-danger/15 text-status-danger"
            }`}
          >
            <BedDouble className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-espresso">
              Kamar {room.room_number}
            </h3>
            <span className="text-[11px] text-cocoa">
              Lantai {room.floor || 1} • {room.type || "Standard AC"}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {isAvailable ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-status-success/15 text-status-success rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Kosong
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-status-danger/15 text-status-danger rounded-full text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" /> Terisi
          </span>
        )}
      </div>

      {/* Price & Action Button */}
      <div className="flex items-center justify-between pt-2 border-t border-cocoa/10">
        <div>
          <span className="text-[10px] text-cocoa block">Harga Sewa</span>
          <span className="text-base font-bold text-coffee font-mono">
            {formatRupiah(room.price_monthly)}
            <span className="text-xs font-sans text-cocoa font-normal">/bln</span>
          </span>
        </div>

        {isAvailable ? (
          <Link
            href="/#contact-person"
            className="py-2.5 px-4 bg-caramel hover:bg-caramel-dark text-espresso font-bold rounded-2xl text-xs shadow-xs active:scale-95 transition-all inline-flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Sewa Kamar Ini</span>
          </Link>
        ) : (
          <span className="py-2 px-3 bg-cocoa/15 text-cocoa rounded-2xl text-xs font-medium">
            Tidak Tersedia
          </span>
        )}
      </div>
    </div>
  );
}
