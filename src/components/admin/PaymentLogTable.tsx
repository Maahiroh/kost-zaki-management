"use client";

import { PaymentLog } from "@/types/database";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { Receipt, Calendar, User, BedDouble } from "lucide-react";

interface PaymentLogTableProps {
  logs: PaymentLog[];
}

export default function PaymentLogTable({ logs }: PaymentLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 bg-latte rounded-3xl border border-cocoa/20">
        <Receipt className="w-10 h-10 text-cocoa mx-auto mb-2 opacity-50" />
        <p className="text-cocoa font-medium text-base">Belum ada riwayat transaksi pembayaran.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card List View (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {logs.map((log) => {
          const tenantName = log.tenant?.name || "Penyewa";
          const roomNum = log.tenant?.room?.room_number || "-";

          return (
            <div
              key={log.id}
              className="bg-latte p-4 rounded-2xl border border-cocoa/20 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-cocoa/10 pb-2">
                <span className="font-mono text-xs font-semibold text-cocoa">
                  #{log.id.slice(-8)}
                </span>
                <span className="inline-flex px-2.5 py-0.5 bg-caramel/20 text-caramel-dark font-bold text-xs rounded-full">
                  {log.duration_months} Bulan
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-espresso text-base">{tenantName}</h4>
                  <span className="text-xs text-cocoa flex items-center gap-1 mt-0.5">
                    <BedDouble className="w-3.5 h-3.5 text-caramel" />
                    Kamar {roomNum}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-cocoa block">Terbayar</span>
                  <span className="font-mono font-bold text-lg text-coffee">
                    {formatRupiah(log.amount || 1500000 * log.duration_months)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-cocoa flex items-center justify-between pt-2 border-t border-cocoa/10">
                <span>Tanggal Pembayaran:</span>
                <span className="font-medium text-espresso flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cocoa" />
                  {formatDateIndo(log.payment_date)}
                </span>
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
                <th className="py-4 px-6">ID Transaksi</th>
                <th className="py-4 px-6">Penyewa & Kamar</th>
                <th className="py-4 px-6">Tanggal Pembayaran</th>
                <th className="py-4 px-6">Durasi Sewa</th>
                <th className="py-4 px-6">Nominal Terbayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa/15 text-sm text-espresso">
              {logs.map((log) => {
                const tenantName = log.tenant?.name || "Penyewa";
                const roomNum = log.tenant?.room?.room_number || "-";

                return (
                  <tr key={log.id} className="hover:bg-cream/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-cocoa">
                      #{log.id.slice(-8)}
                    </td>

                    <td className="py-4 px-6 font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-coffee/10 text-coffee rounded-lg">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-espresso font-bold block">{tenantName}</span>
                          <span className="text-xs text-cocoa font-normal flex items-center gap-1">
                            <BedDouble className="w-3 h-3 text-caramel" />
                            Kamar {roomNum}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-espresso">
                        <Calendar className="w-3.5 h-3.5 text-cocoa" />
                        <span>{formatDateIndo(log.payment_date)}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex px-3 py-1 bg-caramel/20 text-caramel-dark font-bold text-xs rounded-full">
                        {log.duration_months} Bulan
                      </span>
                    </td>

                    <td className="py-4 px-6 font-bold font-mono text-base text-coffee">
                      {formatRupiah(log.amount || 1500000 * log.duration_months)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
