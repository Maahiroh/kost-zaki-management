import { Room, Tenant, PaymentLog, ActivityLog, GalleryPhoto } from "@/types/database";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { hitungExpiryBaru } from "@/lib/utils";

// Initial Mock Data: Exactly 5 Rooms (Harga Rp 750.000/bulan, Lantai 1 Standard)
const INITIAL_ROOMS: Room[] = [
  { id: "room-101", room_number: "101", status: "Kosong", price_monthly: 750000, floor: 1, type: "Standard" },
  { id: "room-102", room_number: "102", status: "Kosong", price_monthly: 750000, floor: 1, type: "Standard" },
  { id: "room-103", room_number: "103", status: "Kosong", price_monthly: 750000, floor: 1, type: "Standard" },
  { id: "room-104", room_number: "104", status: "Kosong", price_monthly: 750000, floor: 1, type: "Standard" },
  { id: "room-105", room_number: "105", status: "Kosong", price_monthly: 750000, floor: 1, type: "Standard" },
];

const DEFAULT_ENTRY_DATES: Record<string, string> = {};

const INITIAL_TENANTS: Tenant[] = [];

// Initial Seed Activity Logs
const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

// Initial Galeri Foto Kos (1 Foto Sample)
const INITIAL_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: "gal-1",
    title: "Foto Kos",
    url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
    category: "Kos",
    created_at: new Date().toISOString(),
  },
];

function getLocalStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      // Clean up old multi-sample gallery photos if stored
      if (key === "kos_gallery_photos" && Array.isArray(parsed)) {
        const hasOldSamples = parsed.some((p: GalleryPhoto) =>
          ["gal-2", "gal-3", "gal-4", "gal-5", "gal-6"].includes(p.id)
        );
        if (hasOldSamples) {
          localStorage.setItem(key, JSON.stringify(fallback));
          return fallback;
        }
      }
      // Clean up old demo tenants if stored
      if (key === "kos_tenants" && Array.isArray(parsed)) {
        const containsOldMock = parsed.some((t: Tenant) =>
          ["Budi Santoso", "Siti Rahma", "Andi Wijaya"].includes(t.name)
        );
        if (containsOldMock) {
          localStorage.setItem(key, JSON.stringify(fallback));
          return fallback;
        }
      }
      // Reset rooms to Kosong if old mock data stored or no tenants exist
      if (key === "kos_rooms" && Array.isArray(parsed)) {
        const isOldData = parsed.length !== 5 || parsed.some((r: Room) => r.price_monthly !== 750000 || r.floor !== 1);
        const containsOldOccupied = parsed.some((r: Room) => r.status === "Terisi");

        let hasNoTenants = true;
        try {
          const tenantsRaw = localStorage.getItem("kos_tenants");
          if (tenantsRaw) {
            const parsedTenants = JSON.parse(tenantsRaw);
            if (Array.isArray(parsedTenants) && parsedTenants.length > 0) {
              hasNoTenants = false;
            }
          }
        } catch {
          hasNoTenants = true;
        }

        if (isOldData || (containsOldOccupied && hasNoTenants)) {
          localStorage.setItem(key, JSON.stringify(fallback));
          return fallback;
        }
      }
      // Reset activity logs if contains old demo tenant logs
      if (key === "kos_activity_logs" && Array.isArray(parsed)) {
        const containsOldLogs = parsed.some((l: ActivityLog) =>
          ["Budi Santoso", "Siti Rahma", "Andi Wijaya"].includes(l.tenant_name || "")
        );
        if (containsOldLogs) {
          const filtered = parsed.filter(
            (l: ActivityLog) => !["Budi Santoso", "Siti Rahma", "Andi Wijaya"].includes(l.tenant_name || "")
          );
          localStorage.setItem(key, JSON.stringify(filtered));
          return filtered as unknown as T;
        }
      }
      return parsed;
    }
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  } catch {
    return fallback;
  }
}

function setLocalStore<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

export const kosService = {
  async getRooms(): Promise<Room[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from("rooms").select("*").order("room_number");
      if (!error && data) return data as Room[];
    }
    return getLocalStore("kos_rooms", INITIAL_ROOMS);
  },

  async getTenants(): Promise<Tenant[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from("tenants").select("*, room:rooms(*)");
      if (!error && data) return data as Tenant[];
    }
    const rooms = await this.getRooms();
    const rawTenants = getLocalStore("kos_tenants", INITIAL_TENANTS);

    let needUpdate = false;
    const sanitizedTenants = rawTenants.map((t) => {
      if (!t.entry_date) {
        needUpdate = true;
        const fallbackDate = DEFAULT_ENTRY_DATES[t.name] || "2026-01-15T00:00:00.000Z";
        return { ...t, entry_date: fallbackDate };
      }
      return t;
    });

    if (needUpdate) {
      setLocalStore("kos_tenants", sanitizedTenants);
    }

    return sanitizedTenants.map((t) => ({
      ...t,
      room: rooms.find((r) => r.id === t.room_id),
    }));
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    const logs = getLocalStore("kos_activity_logs", INITIAL_ACTIVITY_LOGS);
    const seenIds = new Set<string>();
    let modified = false;

    const uniqueLogs = logs.map((log, idx) => {
      let uniqueId = log.id;
      if (!uniqueId || seenIds.has(uniqueId)) {
        uniqueId = `act-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
        modified = true;
      }
      seenIds.add(uniqueId);
      return { ...log, id: uniqueId };
    });

    if (modified) {
      setLocalStore("kos_activity_logs", uniqueLogs);
    }

    return uniqueLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async logActivity(log: Omit<ActivityLog, "id">) {
    const logs = await this.getActivityLogs();
    const newLog: ActivityLog = {
      ...log,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    setLocalStore("kos_activity_logs", [newLog, ...logs]);
    return newLog;
  },

  async addTenant(params: {
    room_id: string;
    name: string;
    whatsapp_number: string;
    duration_months: number;
    entry_date?: string;
  }): Promise<{ tenant: Tenant; paymentLog: any }> {
    const entryDate = params.entry_date || new Date().toISOString();
    const expiryDate = hitungExpiryBaru(null, entryDate, params.duration_months);

    const rooms = await this.getRooms();
    const targetRoom = rooms.find((r) => r.id === params.room_id);
    const roomNumber = targetRoom?.room_number || "Kamar";
    const amount = (targetRoom?.price_monthly || 750000) * params.duration_months;

    await this.logActivity({
      type: "check_in",
      tenant_name: params.name,
      room_number: roomNumber,
      date: entryDate,
      notes: `Penyewa baru masuk ke Kamar ${roomNumber}`,
    });

    await this.logActivity({
      type: "pembayaran",
      tenant_name: params.name,
      room_number: roomNumber,
      date: entryDate,
      amount,
      duration_months: params.duration_months,
      notes: `Pembayaran sewa awal ${params.duration_months} bulan`,
    });

    if (isSupabaseConfigured()) {
      const { data: tenant, error: tenantErr } = await supabase
        .from("tenants")
        .insert({
          room_id: params.room_id,
          name: params.name,
          whatsapp_number: params.whatsapp_number,
          entry_date: entryDate,
          expiry_date: expiryDate,
        })
        .select()
        .single();
      if (tenantErr) throw tenantErr;

      await supabase.from("rooms").update({ status: "Terisi" }).eq("id", params.room_id);
      return { tenant, paymentLog: null };
    }

    // --- MOCK FALLBACK MODE ---
    const updatedRooms = rooms.map((r) =>
      r.id === params.room_id ? { ...r, status: "Terisi" as const } : r
    );
    setLocalStore("kos_rooms", updatedRooms);

    const newTenant: Tenant = {
      id: "tenant-" + Date.now(),
      room_id: params.room_id,
      name: params.name,
      whatsapp_number: params.whatsapp_number,
      entry_date: entryDate,
      expiry_date: expiryDate,
    };
    const currentTenants = getLocalStore("kos_tenants", INITIAL_TENANTS);
    setLocalStore("kos_tenants", [newTenant, ...currentTenants]);

    return { tenant: newTenant, paymentLog: null };
  },

  async recordPayment(params: {
    tenant_id: string;
    duration_months: number;
    payment_date?: string;
  }): Promise<{ updatedTenant: Tenant }> {
    const paymentDate = params.payment_date || new Date().toISOString();
    const tenants = await this.getTenants();
    const tenant = tenants.find((t) => t.id === params.tenant_id);
    if (!tenant) throw new Error("Penyewa tidak ditemukan.");

    const newExpiryDate = hitungExpiryBaru(tenant.expiry_date, paymentDate, params.duration_months);
    const roomNumber = tenant.room?.room_number || "Kamar";
    const amount = (tenant.room?.price_monthly || 750000) * params.duration_months;

    await this.logActivity({
      type: "pembayaran",
      tenant_name: tenant.name,
      room_number: roomNumber,
      date: paymentDate,
      amount,
      duration_months: params.duration_months,
      notes: `Perpanjangan sewa ${params.duration_months} bulan`,
    });

    if (isSupabaseConfigured()) {
      const { data: updatedTenant, error: tenantErr } = await supabase
        .from("tenants")
        .update({ expiry_date: newExpiryDate })
        .eq("id", params.tenant_id)
        .select("*, room:rooms(*)")
        .single();
      if (tenantErr) throw tenantErr;
      return { updatedTenant };
    }

    const updatedTenants = tenants.map((t) =>
      t.id === params.tenant_id ? { ...t, expiry_date: newExpiryDate } : t
    );
    setLocalStore("kos_tenants", updatedTenants);
    const updatedTenant = updatedTenants.find((t) => t.id === params.tenant_id)!;
    return { updatedTenant };
  },

  async checkoutTenant(tenantId: string, roomId: string): Promise<void> {
    const tenants = await this.getTenants();
    const tenant = tenants.find((t) => t.id === tenantId);
    const rooms = await this.getRooms();
    const room = rooms.find((r) => r.id === roomId);

    const dateStr = new Date().toISOString();

    if (tenant && room) {
      await this.logActivity({
        type: "check_out",
        tenant_name: tenant.name,
        room_number: room.room_number,
        date: dateStr,
        notes: `Penyewa check-out dari Kamar ${room.room_number}`,
      });
    }

    if (isSupabaseConfigured()) {
      await supabase.from("tenants").delete().eq("id", tenantId);
      await supabase.from("rooms").update({ status: "Kosong" }).eq("id", roomId);
      return;
    }

    const updatedTenants = tenants.filter((t) => t.id !== tenantId);
    setLocalStore("kos_tenants", updatedTenants);

    const updatedRooms = rooms.map((r) =>
      r.id === roomId ? { ...r, status: "Kosong" as const } : r
    );
    setLocalStore("kos_rooms", updatedRooms);
  },

  async updateRoom(params: {
    id: string;
    room_number?: string;
    price_monthly: number;
    floor?: number;
    type?: string;
  }): Promise<Room> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("rooms")
        .update({
          price_monthly: params.price_monthly,
          ...(params.room_number ? { room_number: params.room_number } : {}),
          ...(params.floor ? { floor: params.floor } : {}),
          ...(params.type ? { type: params.type } : {}),
        })
        .eq("id", params.id)
        .select()
        .single();
      if (error) throw error;
      return data as Room;
    }

    const rooms = await this.getRooms();
    const updatedRooms = rooms.map((r) =>
      r.id === params.id
        ? {
          ...r,
          price_monthly: params.price_monthly,
          room_number: params.room_number || r.room_number,
          floor: params.floor ?? r.floor,
          type: params.type || r.type,
        }
        : r
    );
    setLocalStore("kos_rooms", updatedRooms);
    return updatedRooms.find((r) => r.id === params.id)!;
  },

  getWifiInfo(): { ssid: string; password: string } {
    return getLocalStore("kos_wifi_info", {
      ssid: "Kost Zaki Wetan Mantras",
      password: "wetanmantras123",
    });
  },

  updateWifiInfo(ssid: string, password: string): { ssid: string; password: string } {
    const data = { ssid: ssid || "Kost Zaki Wetan Mantras", password: password || "wetanmantras123" };
    setLocalStore("kos_wifi_info", data);
    return data;
  },

  getQrisImage(): string {
    return getLocalStore("kos_qris_image", "/qris-default.svg");
  },

  updateQrisImage(imageSrc: string): string {
    const src = imageSrc || "/qris-default.svg";
    setLocalStore("kos_qris_image", src);
    return src;
  },

  async getAvailabilityStats() {
    const rooms = await this.getRooms();
    const total = rooms.length;
    const kosong = rooms.filter((r) => r.status === "Kosong").length;
    const terisi = total - kosong;
    return { total, kosong, terisi };
  },

  async getGalleryPhotos(): Promise<GalleryPhoto[]> {
    return getLocalStore("kos_gallery_photos", INITIAL_GALLERY_PHOTOS);
  },

  async addGalleryPhoto(params: { title: string; url: string; category?: string }): Promise<GalleryPhoto> {
    const photos = await this.getGalleryPhotos();
    const newPhoto: GalleryPhoto = {
      id: `gal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: params.title || "Foto Kos",
      url: params.url,
      category: params.category || "Fasilitas",
      created_at: new Date().toISOString(),
    };
    const updated = [newPhoto, ...photos];
    setLocalStore("kos_gallery_photos", updated);
    return newPhoto;
  },

  async deleteGalleryPhoto(id: string): Promise<void> {
    const photos = await this.getGalleryPhotos();
    const updated = photos.filter((p) => p.id !== id);
    setLocalStore("kos_gallery_photos", updated);
  },
};
