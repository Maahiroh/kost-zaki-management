"use client";

import { useState, useEffect } from "react";
import { kosService } from "@/lib/services/kosService";
import { QrCode, Download, Upload, X, Check, Image as ImageIcon, Sparkles } from "lucide-react";

interface QrisModalProps {
  isOpen: boolean;
  isAdmin: boolean;
  onClose: () => void;
}

export default function QrisModal({ isOpen, isAdmin, onClose }: QrisModalProps) {
  const [qrisImage, setQrisImage] = useState<string>("/qris-default.svg");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQrisImage(kosService.getQrisImage());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        kosService.updateQrisImage(dataUrl);
        setQrisImage(dataUrl);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefault = () => {
    const defaultSrc = "/qris-default.svg";
    kosService.updateQrisImage(defaultSrc);
    setQrisImage(defaultSrc);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-latte rounded-3xl p-5 max-w-sm w-full border border-cocoa/20 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cocoa/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-coffee text-white rounded-2xl shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-espresso">
                Pembayaran QRIS
              </h3>
              <p className="text-[11px] text-cocoa">Kost Zaki Wetan Mantras</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-cocoa hover:text-espresso rounded-xl hover:bg-cream"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {uploadSuccess && (
          <div className="p-2.5 bg-status-success/15 border border-status-success/30 rounded-2xl text-xs font-semibold text-status-success text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Gambar QRIS Berhasil Diperbarui!</span>
          </div>
        )}

        {/* QRIS Image View */}
        <div className="bg-cream/90 p-3 rounded-2xl border border-cocoa/15 flex flex-col items-center justify-center space-y-3">
          <div className="relative group w-full flex justify-center bg-white p-3 rounded-2xl shadow-xs border border-cocoa/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrisImage}
              alt="QRIS Pembayaran Kost Zaki"
              className="max-h-72 w-auto object-contain rounded-xl"
            />
          </div>

          <div className="text-center">
            <span className="text-[11px] font-bold text-coffee block">
              Mendukung Semua E-Wallet & Mobile Banking
            </span>
            <span className="text-[10px] text-cocoa">
              BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay, dll.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Download Button for Tenant & Admin */}
          <a
            href={qrisImage}
            download="QRIS-Kost-Zaki.png"
            className="w-full py-2.5 px-4 bg-coffee hover:bg-coffee-dark text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Unduh QRIS</span>
          </a>

          {/* Admin Upload / Change QRIS Controls */}
          {isAdmin && (
            <div className="pt-2 border-t border-cocoa/10 space-y-2">
              <label className="text-[11px] font-bold text-espresso block">
                Ubah Gambar QRIS (Khusus Admin):
              </label>
              <div className="flex gap-2">
                <label className="flex-1 py-2 px-3 bg-caramel/20 hover:bg-caramel/30 border border-caramel/40 text-espresso font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all">
                  <Upload className="w-3.5 h-3.5 text-coffee" />
                  <span>Upload Gambar Baru</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {qrisImage !== "/qris-default.svg" && (
                  <button
                    onClick={handleResetDefault}
                    className="py-2 px-3 bg-cream text-cocoa hover:text-espresso border border-cocoa/20 rounded-2xl text-[11px] font-semibold"
                    title="Reset ke QRIS Default"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
