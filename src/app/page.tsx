"use client";

import AvailabilityStats from "@/components/public/AvailabilityStats";
import FacilityList from "@/components/public/FacilityList";
import LocationMap from "@/components/public/LocationMap";
import KosGallery from "@/components/public/KosGallery";
import ContactPersonButtons from "@/components/public/ContactPersonButtons";
import { KOS_NAME, KOS_SLOGAN } from "@/lib/constants";
import Link from "next/link";
import { ArrowRight, Sparkles, UserCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-5">
      {/* Soft Mobile Hero Card */}
      <section className="relative rounded-3xl bg-gradient-to-br from-coffee via-coffee-dark to-espresso text-white p-6 shadow-soft overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-caramel/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-caramel/30 text-caramel-light font-semibold text-[10px] uppercase tracking-wider rounded-full backdrop-blur-xs">
            <Sparkles className="w-3 h-3 text-caramel" />
            Wetan Mantras Kos
          </div>

          <h1 className="font-serif text-2xl font-bold leading-tight">
            {KOS_NAME}
          </h1>

          <p className="text-white/80 text-xs leading-relaxed font-light">
            {KOS_SLOGAN}
          </p>

          <div className="pt-2 flex items-center gap-2">
            <Link
              href="/rooms"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-caramel hover:bg-caramel-dark text-espresso font-bold rounded-2xl text-xs shadow-xs active:scale-95 transition-all"
            >
              Cek Ketersediaan Kamar
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center p-2.5 bg-white/15 text-white font-semibold rounded-2xl border border-white/20 active:scale-95 transition-all"
              title="Portal Login"
            >
              <UserCheck className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Live Room Availability Stats */}
      <AvailabilityStats />

      {/* Fasilitas Kos */}
      <FacilityList />

      {/* Peta Google Maps Lokasi Kost */}
      <LocationMap />

      {/* Galeri Foto Kos (Admin Bikin & Kelola) */}
      <KosGallery />

      {/* Hubungi Admin (2 Tombol WhatsApp Kanan & Kiri) */}
      <ContactPersonButtons />
    </div>
  );
}
