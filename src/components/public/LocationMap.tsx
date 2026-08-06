import { MapPin, Navigation, ExternalLink } from "lucide-react";

export default function LocationMap() {
  const mapsUrl = "https://maps.app.goo.gl/JB2uAcrbos2msjsP7";

  return (
    <section className="bg-latte rounded-3xl p-4 sm:p-5 border border-cocoa/15 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-cocoa uppercase tracking-wider block">
            Lokasi Kost
          </span>
          <h2 className="font-serif font-bold text-base text-espresso">
            Peta & Petunjuk Arah
          </h2>
        </div>
        <span className="text-[10px] bg-caramel/20 text-coffee px-2.5 py-1 rounded-full font-bold">
          Wetan Mantras
        </span>
      </div>

      {/* Address Details Card */}
      <div className="p-2.5 bg-cream/60 rounded-2xl border border-cocoa/10 flex items-center gap-2 text-xs">
        <MapPin className="w-4 h-4 text-coffee shrink-0" />
        <div className="min-w-0">
          <span className="font-bold text-espresso block truncate text-[11px]">
            Kost Zaki Wetan Mantras
          </span>
          <span className="text-cocoa text-[10px] truncate block">
            Akses strategis & dekat fasilitas umum
          </span>
        </div>
      </div>

      {/* Embedded Google Maps Preview Frame */}
      <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-cocoa/15 shadow-inner bg-cream/40">
        <iframe
          title="Kost Zaki Wetan Mantras Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.0!2d110.3!3d-7.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDgnMDAuMCJTIDExMMKwMTgnMDAuMCJF!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full filter saturate-90"
        />

        {/* Overlay Action Banner */}
        <div className="absolute inset-x-2.5 bottom-2.5 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-cocoa/15 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-caramel/25 text-coffee rounded-lg">
              <Navigation className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-espresso">Google Maps</span>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 py-1.5 px-2.5 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition-all"
          >
            <span>Buka Peta</span>
            <ExternalLink className="w-3 h-3 text-caramel-light" />
          </a>
        </div>
      </div>
    </section>
  );
}
