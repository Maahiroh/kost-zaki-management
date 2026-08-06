import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addMonths, isAfter, parseISO, format, differenceInDays, differenceInHours } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format Tanggal Masuk penyewa menjadi format Password DDMMYY
 * Misal: 15 Januari 2026 -> "150126"
 * Misal: 1 Agustus 2026 -> "010826"
 */
export function formatTanggalMasukPassword(dateStr: string): string {
  if (!dateStr) return "150126";
  try {
    const d = parseISO(dateStr);
    return format(d, "ddMMyy");
  } catch {
    return "150126";
  }
}

/**
 * Aturan PRD Akumulasi Waktu:
 * Jika penyewa membayar SEBELUM masa aktif habis (payment_date < expiry_date),
 * durasi baru ditambahkan dari tanggal jatuh tempo sebelumnya (expiry_date), BUKAN dari tanggal pembayaran.
 * Jika telat bayar (payment_date >= expiry_date) atau penyewa baru, dihitung dari tanggal pembayaran.
 */
export function hitungExpiryBaru(
  expirySekarangStr: string | null | undefined,
  paymentDateStr: string,
  durationMonths: number
): string {
  const paymentDate = parseISO(paymentDateStr);
  let baseDate = paymentDate;

  if (expirySekarangStr) {
    const currentExpiry = parseISO(expirySekarangStr);
    if (isAfter(currentExpiry, paymentDate)) {
      baseDate = currentExpiry;
    }
  }

  const newExpiry = addMonths(baseDate, durationMonths);
  return newExpiry.toISOString();
}

/**
 * Perhitungan sisa hari & jam countdown sewa
 */
export function hitungSisaHari(expiryDateStr: string) {
  if (!expiryDateStr) {
    return {
      days: 0,
      hours: 0,
      status: 'kadaluarsa' as const,
      formatted: 'Expired',
    };
  }

  const now = new Date();
  const expiry = parseISO(expiryDateStr);

  if (isAfter(now, expiry)) {
    const daysOverdue = Math.abs(differenceInDays(now, expiry));
    return {
      days: -daysOverdue,
      hours: 0,
      status: 'kadaluarsa' as const,
      formatted: `Kadaluarsa (${daysOverdue} hari lalu)`,
    };
  }

  const days = differenceInDays(expiry, now);
  const hours = differenceInHours(expiry, now) % 24;

  let status: 'aktif' | 'hampir_habis' | 'kadaluarsa' = 'aktif';
  if (days <= 3) {
    status = 'kadaluarsa';
  } else if (days <= 7) {
    status = 'hampir_habis';
  }

  let formatted = "";
  if (days > 0) {
    formatted = `${days} hari`;
  } else if (days === 0) {
    formatted = `Hari ini`;
  } else {
    formatted = `Kadaluarsa`;
  }

  return {
    days,
    hours,
    status,
    formatted,
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    return format(parseISO(dateStr), "dd MMMM yyyy");
  } catch {
    return dateStr;
  }
}

/**
 * Direct WhatsApp Link tanpa template chat (langsung terhubung)
 */
export function formatWhatsAppLink(phone: string): string {
  let cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  }

  return `https://wa.me/${cleanPhone}`;
}
