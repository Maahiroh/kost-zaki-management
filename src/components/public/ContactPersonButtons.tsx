import { MessageCircle, PhoneCall } from "lucide-react";
import { formatWhatsAppLink } from "@/lib/utils";

export default function ContactPersonButtons() {
  const admin1Phone = "087839640888";
  const admin2Phone = "089657466665";

  const admin1Link = formatWhatsAppLink(admin1Phone);
  const admin2Link = formatWhatsAppLink(admin2Phone);

  return (
    <section
      id="contact-person"
      className="bg-latte rounded-3xl p-4 sm:p-5 border border-cocoa/15 shadow-card space-y-3 scroll-mt-20"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-cocoa uppercase tracking-wider block">
            Contact Person
          </span>
          <h2 className="font-serif font-bold text-base text-espresso">
            Hubungi Admin
          </h2>
        </div>
        <span className="text-[10px] bg-caramel/20 text-coffee px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
          <PhoneCall className="w-3 h-3" />
          Fast Response
        </span>
      </div>

      {/* 2 Buttons Side-by-Side (Kanan & Kiri) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Left Button - Admin 1 */}
        <a
          href={admin1Link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] rounded-2xl text-center active:scale-95 transition-all shadow-2xs group"
        >
          <div className="p-2 bg-[#25D366] text-white rounded-xl mb-1.5 shadow-xs group-hover:scale-105 transition-transform">
            <MessageCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-espresso block leading-tight">
            Chat Admin 1
          </span>
          <span className="text-[10px] text-cocoa font-mono font-medium block mt-0.5">
            0878-3964-0888
          </span>
        </a>

        {/* Right Button - Admin 2 */}
        <a
          href={admin2Link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] rounded-2xl text-center active:scale-95 transition-all shadow-2xs group"
        >
          <div className="p-2 bg-[#25D366] text-white rounded-xl mb-1.5 shadow-xs group-hover:scale-105 transition-transform">
            <MessageCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-espresso block leading-tight">
            Chat Admin 2
          </span>
          <span className="text-[10px] text-cocoa font-mono font-medium block mt-0.5">
            0896-5746-6665
          </span>
        </a>
      </div>
    </section>
  );
}
