"use client";

import { useEffect } from "react";
import { kosService } from "@/lib/services/kosService";
import { hitungSisaHari, formatDateIndo } from "@/lib/utils";

/**
 * Headless PWA Service Worker & Native Web Push Manager
 * - MENAMPILKAN 0 UI (Tanpa Banner, Toast, Snackbar, Alert, atau Modal di dalam aplikasi).
 * - Mendorong Web Push Notification langsung ke OS (Notification Tray / Status Bar Android).
 * - Mengirimkan push notification hanya ke 2 pihak:
 *    1. Admin (seluruh penyewa yang jatuh tempo <= 7 hari)
 *    2. Penyewa spesifik yang bersangkutan (misal: "Yaya" jika jatuh tempo <= 7 hari).
 *    3. Penyewa lain TIDAK menerima notifikasi apapun.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Check environment: Only register SW in production mode
    const isDev =
      process.env.NODE_ENV === "development" ||
      (typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname.startsWith("192.168.") ||
          window.location.hostname.startsWith("127.0.0.")));

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (isDev) {
        // In development mode, unregister any active SW & clear cache to prevent stale CSS 404 errors
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key);
            }
          });
        }
      } else {
        // In production mode, register Service Worker normally
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => {
              console.log("ServiceWorker registered in background with scope:", reg.scope);
            })
            .catch((err) => {
              console.warn("ServiceWorker registration failed:", err);
            });
        });
      }
    }

    // 2. Minta Izin Notifikasi OS jika belum pernah diberikan / diminta
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }

    // 3. Pengecekan Latar Belakang untuk OS Web Push Notification (Jatuh Tempo <= 7 Hari)
    const checkAndTriggerPushNotifications = async () => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      try {
        const authDataStr = localStorage.getItem("kos_auth_user");
        if (!authDataStr) return;

        const authUser = JSON.parse(authDataStr) as { role: string; email: string };
        const tenants = await kosService.getTenants();
        const rooms = await kosService.getRooms();

        // Enrich data tenant dengan sisa hari & data kamar
        const enriched = tenants.map((t) => {
          const roomObj = rooms.find((r) => r.id === t.room_id);
          const sisa = hitungSisaHari(t.expiry_date);
          return { ...t, room: roomObj, sisa };
        });

        // Filter penyewa yang jatuh tempo <= 7 hari (dan belum lewat lebih dari 30 hari)
        const dueSoon = enriched.filter((t) => t.sisa.days <= 7 && t.sisa.days >= -30);

        // Kunci sessionStorage agar tidak spaming push notifikasi berulang-ulang dalam 1 sesi
        const sessionNotifKey = `os_push_sent_${authUser.role}_${authUser.email}`;
        if (sessionStorage.getItem(sessionNotifKey)) return;

        // PUSH NOTIFICATION UNTUK ADMIN
        if (authUser.role === "admin" && dueSoon.length > 0) {
          const names = dueSoon
            .map((t) => `${t.name} (Kamar ${t.room?.room_number || ""})`)
            .join(", ");
          const title = `⚠️ Peringatan Jatuh Tempo Sewa Kos (${dueSoon.length} Penyewa)`;
          const body = `Penyewa berikut akan jatuh tempo minggu ini: ${names}.`;

          await sendNativeOsNotification(title, body, "/admin/payments");
          sessionStorage.setItem(sessionNotifKey, "true");
        }
        // PUSH NOTIFICATION UNTUK PENYEWA SPESIFIK (Misal: "Yaya")
        else if (authUser.role === "tenant" && authUser.email) {
          const me = enriched.find(
            (t) => t.name.toLowerCase().trim() === authUser.email.toLowerCase().trim()
          );

          // HANYA jika akun penyewa spesifik ini yang jatuh tempo <= 7 hari!
          if (me && me.sisa.days <= 7 && me.sisa.days >= -30) {
            const title = `⚠️ Pengingat Jatuh Tempo Sewa Kost Zaki`;
            const body = `Halo ${me.name}, masa sewa Kamar ${me.room?.room_number || ""} Anda akan jatuh tempo dalam ${me.sisa.days} hari lagi (${formatDateIndo(me.expiry_date)}).`;

            await sendNativeOsNotification(title, body, "/");
            sessionStorage.setItem(sessionNotifKey, "true");
          }
        }
      } catch (err) {
        console.warn("Gagal mengeksekusi push notification OS:", err);
      }
    };

    // Jalankan pemeriksaan notifikasi OS saat komponen dimuat
    checkAndTriggerPushNotifications();
  }, []);

  // Return null secara mutlak -> 0 Komponen UI (Tanpa Banner, Toast, Alert, dll)
  return null;
}

// Utility function untuk mengirimkan Push Notification langsung ke OS Notification Tray
async function sendNativeOsNotification(title: string, body: string, targetUrl: string) {
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        vibrate: [200, 100, 200],
        data: { url: targetUrl },
        tag: `expiry-notif-${Date.now()}`,
      } as NotificationOptions & { vibrate?: number[]; badge?: string; tag?: string });
      return;
    } catch {
      // Fallback jika SW belum ready
    }
  }

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
    });
  }
}
