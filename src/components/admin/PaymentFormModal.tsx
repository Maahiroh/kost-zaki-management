"use client";

import { useState } from "react";
import { Tenant } from "@/types/database";
import { DURATION_OPTIONS } from "@/lib/constants";
import { kosService } from "@/lib/services/kosService";
import { formatRupiah, formatDateIndo, hitungExpiryBaru } from "@/lib/utils";
import { X, CreditCard, CheckCircle, Info } from "lucide-react";

interface PaymentFormModalProps {
  tenants: Tenant[];
  selectedTenantId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentFormModal({
  tenants,
  selectedTenantId,
  onClose,
  onSuccess,
}: PaymentFormModalProps) {
  const activeTenants = tenants.filter((t) => t.name);

  const [tenantId, setTenantId] = useState(selectedTenantId || activeTenants[0]?.id || "");
  const [durationMonths, setDurationMonths] = useState(1);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentTenant = tenants.find((t) => t.id === tenantId);
  const currentExpiry = currentTenant?.expiry_date;
  
  const simulatedNewExpiry = currentTenant
    ? hitungExpiryBaru(currentExpiry, paymentDate, durationMonths)
    : "";

  const monthlyPrice = currentTenant?.room?.price_monthly || 1500000;
  const totalAmount = monthlyPrice * durationMonths;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      setErrorMsg("Pilih penyewa terlebih dahulu.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await kosService.recordPayment({
        tenant_id: tenantId,
        duration_months: durationMonths,
        payment_date: new Date(paymentDate).toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to record payment", err);
      setErrorMsg(err.message || "Gagal mencatat pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-espresso/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-latte rounded-t-3xl sm:rounded-3xl p-5 max-w-md w-full border border-cocoa/20 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto mb-14 sm:mb-0 pb-8 sm:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cocoa/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-caramel/25 text-coffee rounded-2xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-espresso">
                Catat Pembayaran
              </h2>
              <p className="text-[11px] text-cocoa">Akumulasi countdown sewa otomatis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-cocoa hover:text-espresso rounded-xl hover:bg-cream"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-status-danger/15 text-status-danger text-xs font-semibold rounded-2xl border border-status-danger/30">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Tenant Selector */}
          <div>
            <label className="block text-xs font-semibold text-espresso mb-1">
              Pilih Penyewa *
            </label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-cream rounded-2xl border border-cocoa/20 text-xs font-semibold text-espresso focus:outline-none focus:border-coffee"
            >
              <option value="">-- Pilih Penyewa --</option>
              {activeTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Kamar {t.room?.room_number || t.room_id})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-xs font-semibold text-espresso mb-1">
              Tanggal Pembayaran *
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream rounded-2xl border border-cocoa/20 text-xs text-espresso focus:outline-none focus:border-coffee"
            />
          </div>

          {/* Rent Duration */}
          <div>
            <label className="block text-xs font-semibold text-espresso mb-1">
              Durasi Sewa Tambahan *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setDurationMonths(opt.months)}
                  className={`py-2 px-3 rounded-2xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                    durationMonths === opt.months
                      ? "bg-coffee text-white border-coffee shadow-xs"
                      : "bg-cream text-espresso border-cocoa/20 hover:border-cocoa"
                  }`}
                >
                  <span>{opt.label}</span>
                  {durationMonths === opt.months && <CheckCircle className="w-3.5 h-3.5 text-caramel-light" />}
                </button>
              ))}
            </div>
          </div>

          {/* Accumulation Preview */}
          {currentTenant && (
            <div className="p-3 bg-caramel/15 border border-caramel/30 rounded-2xl space-y-1.5 text-xs text-espresso">
              <div className="flex items-center gap-1 font-bold text-coffee text-[11px]">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Simulasi Akumulasi Waktu (PRD)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-caramel/20 text-[11px]">
                <div>
                  <span className="text-cocoa block text-[10px]">Tempo Lama:</span>
                  <span className="font-semibold">{formatDateIndo(currentExpiry || "")}</span>
                </div>
                <div>
                  <span className="text-cocoa block text-[10px]">Tempo Baru:</span>
                  <span className="font-bold text-status-success">{formatDateIndo(simulatedNewExpiry)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Total Payment Amount */}
          <div className="p-3.5 bg-cream/70 border border-cocoa/15 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-cocoa block">Jumlah Terbayar</span>
              <span className="text-lg font-bold text-coffee font-mono">
                {formatRupiah(totalAmount)}
              </span>
            </div>
            <span className="text-xs font-semibold text-caramel-dark">
              {durationMonths} Bulan
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-cocoa/20 text-xs font-semibold text-espresso hover:bg-cream"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-coffee hover:bg-coffee-dark text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Pembayaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
