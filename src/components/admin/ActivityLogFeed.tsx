"use client";

import { ActivityLog } from "@/types/database";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { Receipt, Calendar, User, BedDouble, LogIn, LogOut, CreditCard } from "lucide-react";

interface ActivityLogFeedProps {
  logs: ActivityLog[];
}

export default function ActivityLogFeed({ logs }: ActivityLogFeedProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-10 bg-latte rounded-3xl border border-cocoa/15 p-4 space-y-1">
        <Receipt className="w-8 h-8 text-cocoa mx-auto opacity-50" />
        <p className="text-cocoa font-medium text-xs">
          Tidak ada riwayat log kegiatan pada periode ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {logs.map((log, index) => {
        const isPayment = log.type === "pembayaran";
        const isCheckIn = log.type === "check_in";
        const isCheckOut = log.type === "check_out";

        return (
          <div
            key={log.id || `act-feed-${index}`}
            className="bg-latte p-3.5 rounded-2xl border border-cocoa/15 shadow-card space-y-2"
          >
            {/* Top Bar: Type Badge & Date */}
            <div className="flex items-center justify-between border-b border-cocoa/10 pb-2">
              <div className="flex items-center gap-1.5">
                {isPayment && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-status-success/15 text-status-success rounded-full text-[11px] font-bold">
                    <CreditCard className="w-3 h-3" /> Pembayaran
                  </span>
                )}
                {isCheckIn && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/15 text-blue-600 rounded-full text-[11px] font-bold">
                    <LogIn className="w-3 h-3" /> Check-in
                  </span>
                )}
                {isCheckOut && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-status-danger/15 text-status-danger rounded-full text-[11px] font-bold">
                    <LogOut className="w-3 h-3" /> Check-out
                  </span>
                )}

                <span className="text-[11px] font-bold text-coffee bg-caramel/20 px-2 py-0.5 rounded-md">
                  Kamar {log.room_number}
                </span>
              </div>

              <span className="text-[11px] font-medium text-cocoa flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cocoa" />
                {formatDateIndo(log.date)}
              </span>
            </div>

            {/* Content: Tenant Name & Details */}
            <div className="flex items-center justify-between pt-0.5">
              <div>
                <h4 className="font-bold text-espresso text-sm flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-coffee" />
                  {log.tenant_name}
                </h4>
                {log.notes && (
                  <p className="text-[11px] text-cocoa mt-0.5">
                    {log.notes}
                  </p>
                )}
              </div>

              {/* Amount if payment */}
              {isPayment && log.amount && (
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-cocoa block">Terbayar</span>
                  <span className="font-mono font-bold text-sm text-coffee">
                    {formatRupiah(log.amount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
