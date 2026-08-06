"use client";

import { useEffect, useState } from "react";
import { kosService } from "@/lib/services/kosService";
import { CheckCircle2, AlertCircle, Building2 } from "lucide-react";

export default function AvailabilityStats() {
  const [stats, setStats] = useState<{ total: number; kosong: number; terisi: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await kosService.getAvailabilityStats();
      setStats(data);
    } catch (e) {
      console.error("Failed to load availability stats", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-latte rounded-3xl p-4 sm:p-5 border border-cocoa/15 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-cocoa uppercase tracking-wider block">
            Status Real-time
          </span>
          <h2 className="font-serif font-bold text-base text-espresso">
            Ketersediaan Kamar
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] bg-status-success/15 text-status-success px-2.5 py-1 rounded-full font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
          Live Update
        </span>
      </div>

      {/* Grid Stats matching mobile size */}
      <div className="grid grid-cols-3 gap-2">
        {/* Total */}
        <div className="bg-cream/60 p-2.5 rounded-2xl border border-cocoa/10 text-center">
          <Building2 className="w-4 h-4 text-coffee mx-auto mb-1 opacity-80" />
          <span className="text-[10px] text-cocoa block uppercase font-medium">Total</span>
          <span className="text-lg font-bold text-espresso font-mono">
            {loading ? "..." : stats?.total}
          </span>
        </div>

        {/* Kosong */}
        <div className="bg-status-success/10 p-2.5 rounded-2xl border border-status-success/30 text-center">
          <CheckCircle2 className="w-4 h-4 text-status-success mx-auto mb-1" />
          <span className="text-[10px] text-status-success block uppercase font-bold">Kosong</span>
          <span className="text-lg font-extrabold text-status-success font-mono">
            {loading ? "..." : stats?.kosong}
          </span>
        </div>

        {/* Terisi */}
        <div className="bg-status-danger/10 p-2.5 rounded-2xl border border-status-danger/30 text-center">
          <AlertCircle className="w-4 h-4 text-status-danger mx-auto mb-1" />
          <span className="text-[10px] text-status-danger block uppercase font-medium">Terisi</span>
          <span className="text-lg font-bold text-status-danger font-mono">
            {loading ? "..." : stats?.terisi}
          </span>
        </div>
      </div>
    </section>
  );
}
