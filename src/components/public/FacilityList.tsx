import { STANDARD_FACILITIES } from "@/lib/constants";
import { Wifi, Fan, Bath, Bed, Box, ShieldCheck, Zap } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  Fan,
  Bath,
  Bed,
  Box,
  ShieldCheck,
  Zap,
};

export default function FacilityList() {
  return (
    <section className="bg-latte rounded-3xl p-4 sm:p-5 border border-cocoa/15 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-cocoa uppercase tracking-wider block">
            Fasilitas Lengkap
          </span>
          <h2 className="font-serif font-bold text-base text-espresso">
            Fasilitas Kost Zaki
          </h2>
        </div>
        <span className="text-[10px] bg-caramel/20 text-coffee px-2.5 py-1 rounded-full font-bold">
          {STANDARD_FACILITIES.length} Fasilitas
        </span>
      </div>

      {/* Mobile-tailored Grid Layout (2-columns on HP, 3-columns on SM) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {STANDARD_FACILITIES.map((fac, idx) => {
          const Icon = ICON_MAP[fac.icon] || ShieldCheck;

          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-cream/60 border border-cocoa/10 hover:border-caramel/50 transition-colors shadow-2xs"
            >
              <div className="p-2 bg-caramel/25 text-coffee rounded-xl shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-espresso text-xs truncate">
                  {fac.name}
                </h3>
                <p className="text-[10px] text-cocoa truncate">
                  {fac.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
