"use client";

import { useState, useEffect } from "react";
import { kosService } from "@/lib/services/kosService";
import { Wifi, Edit2, Check, Copy, Key, Signal } from "lucide-react";

interface WifiCardProps {
  isAdmin: boolean;
}

export default function WifiCard({ isAdmin }: WifiCardProps) {
  const [wifiInfo, setWifiInfo] = useState({ ssid: "Kost Zaki Wetan Mantras", password: "wetanmantras123" });
  const [isEditing, setIsEditing] = useState(false);
  const [ssidInput, setSsidInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const current = kosService.getWifiInfo();
    setWifiInfo(current);
    setSsidInput(current.ssid);
    setPasswordInput(current.password);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = kosService.updateWifiInfo(ssidInput, passwordInput);
    setWifiInfo(updated);
    setIsEditing(false);
  };

  const handleCopyPassword = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(wifiInfo.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-3.5 sm:p-4 bg-gradient-to-r from-latte via-cream to-caramel/15 rounded-2xl border border-cocoa/20 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-coffee/15 text-coffee rounded-xl">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-cocoa block uppercase tracking-wider">
              Fasilitas Wi-Fi Kos
            </span>
            <span className="text-xs font-extrabold text-espresso flex items-center gap-1">
              <Signal className="w-3 h-3 text-status-success" />
              {wifiInfo.ssid}
            </span>
          </div>
        </div>

        {isAdmin && !isEditing && (
          <button
            onClick={() => {
              setSsidInput(wifiInfo.ssid);
              setPasswordInput(wifiInfo.password);
              setIsEditing(true);
            }}
            className="px-2.5 py-1 bg-coffee text-white text-[11px] font-bold rounded-xl hover:bg-coffee-dark transition-colors flex items-center gap-1 shrink-0"
          >
            <Edit2 className="w-3 h-3" />
            <span>Ubah Wi-Fi</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-2 pt-1 border-t border-cocoa/10">
          <div>
            <label className="block text-[10px] font-semibold text-cocoa mb-0.5">Nama Wi-Fi (SSID)</label>
            <input
              type="text"
              required
              value={ssidInput}
              onChange={(e) => setSsidInput(e.target.value)}
              className="w-full px-3 py-1.5 bg-cream rounded-xl border border-cocoa/20 text-xs text-espresso focus:outline-none focus:border-coffee"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-cocoa mb-0.5">Password Wi-Fi Baru</label>
            <input
              type="text"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-3 py-1.5 bg-cream rounded-xl border border-cocoa/20 text-xs text-espresso font-mono focus:outline-none focus:border-coffee"
            />
          </div>
          <div className="flex gap-1.5 pt-1 justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-cream text-espresso text-xs font-semibold rounded-xl border border-cocoa/20 hover:bg-cocoa/10"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 bg-coffee text-white text-xs font-bold rounded-xl hover:bg-coffee-dark"
            >
              Simpan
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between bg-cream/80 px-3 py-2 rounded-xl border border-cocoa/15">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <Key className="w-3.5 h-3.5 text-caramel-dark shrink-0" />
            <span className="text-cocoa text-[11px]">Pass:</span>
            <span className="font-bold text-espresso tracking-wide">{wifiInfo.password}</span>
          </div>

          <button
            onClick={handleCopyPassword}
            className="p-1 text-coffee hover:text-espresso rounded-lg hover:bg-caramel/20 text-[11px] font-semibold flex items-center gap-1 transition-colors"
            title="Salin Password"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-status-success" />
                <span className="text-status-success text-[10px]">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px]">Salin</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
