"use client";

import { hitungSisaHari } from "@/lib/utils";
import { Clock, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

interface CountdownBadgeProps {
  expiryDate: string;
}

export default function CountdownBadge({ expiryDate }: CountdownBadgeProps) {
  const countdown = hitungSisaHari(expiryDate);

  // 1. KADALUARSA / OVERDUE (sisa hari < 0) -> Format "Lebih X hari" dengan WARNA MERAH NGEBLOK SOLID
  if (countdown.days < 0) {
    const daysOverdue = Math.abs(countdown.days);
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-status-danger text-white rounded-full text-[11px] font-extrabold shadow-md animate-pulse">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-white" />
        <span>Lebih {daysOverdue} hari</span>
      </span>
    );
  }

  // 2. MENDESAK (0 s/d 7 hari lagi) -> Tampilan Merah Soft
  if (countdown.days <= 7) {
    const labelText =
      countdown.days === 0 ? "Jatuh Tempo Hari Ini" : `Sisa ${countdown.days} hari`;

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-status-danger/15 text-status-danger border border-status-danger/30 rounded-full text-[11px] font-bold shadow-xs">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>{labelText}</span>
      </span>
    );
  }

  // 3. AMAN (> 7 hari lagi) -> Tampilan Hijau Soft
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-status-success/15 text-status-success border border-status-success/30 rounded-full text-[11px] font-bold shadow-xs">
      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
      <span>Sisa {countdown.days} hari</span>
    </span>
  );
}
