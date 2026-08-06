# ARCHITECTURE.md — Sistem Manajemen Kos

Dokumen arsitektur teknis untuk aplikasi web Sistem Manajemen Kos (Web Umum & Admin), berdasarkan PRD.

---

## 1. Ringkasan Arsitektur

Aplikasi dibangun dengan pendekatan **BaaS (Backend-as-a-Service)** agar sederhana, cepat dirilis, dan minim perawatan server.

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Mobile & Desktop)          │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────┐
│              Frontend — Next.js + Tailwind CSS          │
│  ├─ Halaman Public (Info Kos, Ketersediaan, Login)      │
│  ├─ Dashboard Admin (Manajemen Kamar, Log Pembayaran)   │
│  └─ React Query / SWR untuk data fetching & cache       │
└──────────────────────────┬──────────────────────────────┘
                           │ SDK / REST API
┌──────────────────────────▼──────────────────────────────┐
│              Backend & Database — Supabase (BaaS)       │
│  ├─ PostgreSQL (Relasional: rooms, tenants, payment_logs)│
│  ├─ Auth (Admin & Penyewa login)                        │
│  └─ Realtime (countdown ketersediaan kamar otomatis)    │
└─────────────────────────────────────────────────────────┘
```

**Pilihan Teknologi Utama**

| Lapisan        | Teknologi            | Alasan                                          |
| -------------- | -------------------- | ----------------------------------------------- |
| Frontend       | Next.js + Tailwind   | SSR/ISR untuk SEO halaman publik, mobile-responsive |
| Data Fetching  | React Query (TanStack Query) | Cache, revalidation real-time countdown    |
| Backend        | Supabase (BaaS)      | PostgreSQL + Auth + Realtime dalam satu layanan |
| Hosting        | Vercel               | Deploy otomatis, integrasi langsung dengan Next.js |

---

## 2. Struktur Direktori Project

```
kos-management/
├── public/                    # Aset statis (logo, favicon, gambar)
├── src/
│   ├── app/                   # App Router Next.js
│   │   ├── page.tsx           # Halaman utama (Info Kos)
│   │   ├── rooms/             # Halaman ketersediaan kamar
│   │   ├── login/             # Portal login (Admin & Penyewa)
│   │   ├── admin/             # Dashboard Admin (protected)
│   │   │   ├── page.tsx       # Manajemen kamar
│   │   │   └── payments/      # Log pembayaran & countdown
│   │   └── layout.tsx         # Layout root + tema global
│   ├── components/            # Komponen UI reusable
│   │   ├── ui/                # Button, Card, Badge, dsb.
│   │   ├── layout/            # Navbar, Footer, Sidebar
│   │   ├── admin/             # RoomTable, PaymentForm, CountdownBadge
│   │   └── public/            # RoomCard, FacilityList, AvailabilityStats
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # Supabase client (browser)
│   │   │   └── server.ts      # Supabase client (server)
│   │   ├── auth.ts            # Middleware/guard autentikasi
│   │   ├── constants.ts       # Durasi sewa, label status
│   │   └── utils.ts           # Format tanggal, perhitungan countdown
│   ├── hooks/                 # useRooms, useTenants, usePaymentLogs, useCountdown
│   ├── styles/
│   │   ├── globals.css        # Tailwind + CSS variables tema
│   │   └── theme.ts           # Konfigurasi tema cokelat-cream
│   └── types/
│       └── database.ts        # TypeScript types (sinkron skema Supabase)
├── supabase/
│   ├── migrations/            # Skema SQL (rooms, tenants, payment_logs)
│   └── seed.sql               # Data contoh
├── .env.local                 # SUPABASE_URL, SUPABASE_ANON_KEY
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

---

## 3. Skema Database (Supabase / PostgreSQL)

Skema relasional sederhana sesuai PRD. Semua tabel berada di bawah **Row Level Security (RLS)**.

### 3.1 Tabel `rooms`

| Kolom         | Tipe             | Keterangan                        |
| ------------- | ---------------- | --------------------------------- |
| `id`          | UUID (PK)        | Primary key                       |
| `room_number` | VARCHAR / INT    | Nomor kamar, unik                 |
| `status`      | ENUM / VARCHAR   | `'Kosong'` \| `'Terisi'`          |

### 3.2 Tabel `tenants`

| Kolom             | Tipe          | Keterangan                              |
| ----------------- | ------------- | --------------------------------------- |
| `id`              | UUID (PK)     | Primary key                             |
| `room_id`         | UUID (FK)     | Relasi ke `rooms.id` (one-to-one)       |
| `name`            | VARCHAR       | Nama penyewa                            |
| `whatsapp_number` | VARCHAR       | Nomor WhatsApp untuk link `wa.me`       |
| `expiry_date`     | TIMESTAMPTZ   | Tanggal jatuh tempo (basis countdown)   |

### 3.3 Tabel `payment_logs`

| Kolom            | Tipe         | Keterangan                          |
| ---------------- | ------------ | ----------------------------------- |
| `id`             | UUID (PK)    | Primary key                         |
| `tenant_id`      | UUID (FK)    | Relasi ke `tenants.id`              |
| `payment_date`   | TIMESTAMPTZ  | Tanggal pembayaran                  |
| `duration_months`| INTEGER      | Durasi sewa (1, 3, dst.)            |

### 3.4 Relasi (ERD)

```
rooms 1 ──── 1 tenants 1 ──── N payment_logs
```

- Satu kamar ditempati maksimal satu penyewa aktif.
- Satu penyewa memiliki banyak riwayat pembayaran.

---

## 4. Logika Bisnis Utama

### 4.1 Countdown Sewa (Akumulasi Waktu)

Aturan inti PRD:

> Jika penyewa membayar **sebelum** masa aktif habis, durasi baru dihitung dari **tanggal jatuh tempo sebelumnya**, BUKAN dari tanggal pembayaran.

```
Contoh: Jatuh tempo tgl 7 → bayar tgl 1 (durasi 3 bulan)
Masa aktif baru = 7 (jatuh tempo lama) + 3 bulan = tgl 7 bulan ke-3
```

**Implementasi:**

```
expiry_baru = MAX(expiry_sekarang, payment_date) + duration_months bulan
```

- Jika `payment_date` < `expiry_date` → gunakan `expiry_date` sebagai basis.
- Jika `payment_date` > `expiry_date` (telat bayar) → gunakan `payment_date` sebagai basis.
- `expiry_date` di-update pada tabel `tenants`, dan log disimpan ke `payment_logs`.

**Fungsi helper** `src/lib/utils.ts`:

```
function hitungExpiryBaru(expirySekarang, paymentDate, durationMonths): Date
function hitungSisaHari(expiryDate): number   // untuk tampilan countdown
```

### 4.2 Ketersediaan Kamar Real-Time

- Jumlah kamar kosong dihitung otomatis dari `rooms.status = 'Kosong'`.
- Menggunakan **Supabase Realtime** + React Query (`useQuery` dengan `revalidate` periodik) agar angka selalu segar tanpa reload manual.

### 4.3 Autentikasi & Otorisasi

| Role    | Akses                        | Guard                          |
| ------- | ---------------------------- | ------------------------------ |
| Umum    | Halaman public (info, kamar) | Tanpa login                    |
| Admin   | Dashboard admin penuh        | Session + role check `admin`   |
| Penyewa | (opsional) Lihat tagihan     | Session penyewa                |

Implementasi via Supabase Auth + middleware Next.js (`src/lib/auth.ts`) yang me-redirect pengguna non-admin dari route `/admin`.

---

## 5. Desain UI — Tema Cokelat Cream Coffee

Palet warna dan gaya visual diterapkan via **Tailwind CSS** (konfigurasi `tailwind.config.ts` + CSS variables).

### 5.1 Palet Warna

| Token       | Hex       | Penggunaan                                    |
| ----------- | --------- | --------------------------------------------- |
| `coffee`    | `#6F4E37` | Warna utama (primary): header, tombol, navbar |
| `espresso`  | `#3E2723` | Warna gelap: teks, footer, teks sekunder      |
| `cocoa`     | `#8D6E63` | Hover, border, elemen sekunder                |
| `cream`     | `#F5EDE0` | Latar belakang utama (background)             |
| `latte`     | `#FFF8F0` | Kartu / panel konten (lighter surface)        |
| `caramel`   | `#D9A05B` | Aksen / highlight, badge countdown            |
| `success`   | `#4C9A6D` | Status kamar `Kosong`                         |
| `danger`    | `#C0564B` | Status kamar `Terisi`, countdown habis        |

### 5.2 Gaya & Komponen

- **Typography**: Serif hangat (mis. `Georgia`/`Playfair Display`) untuk heading, sans-serif untuk body — kesan cozy coffee shop.
- **Surface**: Kartu berlatarbelakang `latte` dengan border `cocoa` tipis & sudut membulat (`rounded-xl`), bayangan lembut.
- **Badge Status**:
  - `Kosong` → badge hijau (`success`) di atas krem.
  - `Terisi` → badge merah (`danger`), menampilkan nama penyewa + tombol WhatsApp (`wa.me/<no>`).
- **Countdown**: Badge `caramel` menampilkan sisa hari, berubah merah saat mendekati habis (≤ 7 hari).
- **Responsive**: Mobile-first — navbar menjadi hamburger menu, tabel kamar menjadi kartu di layar kecil.

---

## 6. Alur Data (Data Flow)

### 6.1 Halaman Public (Ketersediaan Kamar)

```
RoomCard (UI)
   │
   ▼
useRooms() → React Query
   │
   ├─ Server (SSR/ISR) : supabase.from('rooms').select(...)
   └─ Client Realtime  : subscribe changes → invalidate query
   ▼
Jumlah kamar kosong = COUNT(status = 'Kosong') → AvailabilityStats
```

### 6.2 Pencatatan Pembayaran (Admin)

```
PaymentForm (input: tenant, duration_months, payment_date)
   │
   ▼
supabase.from('payment_logs').insert({...})
   │
   ▼
Trigger/Aplikasi menghitung expiry_baru (rule 4.1)
   │
   ▼
supabase.from('tenants').update({ expiry_date })
   │
   ▼
Invalidate React Query → Countdown & UI ter-update real-time
```

### 6.3 Guard Route Admin

```
Request /admin/* → middleware (src/lib/auth.ts)
   ├─ Tidak login        → redirect /login
   ├─ Role != admin      → redirect halaman utama
   └─ Role = admin       → render dashboard
```

---

## 7. Keamanan

- **RLS (Row Level Security)** aktif di semua tabel Supabase; hanya authenticated user yang dapat menulis.
- Policy: `SELECT` publik untuk `rooms` (hanya kolom kamar kosong yang aman), `INSERT/UPDATE` khusus admin.
- Kredensial hanya di `.env.local` (Supabase URL + anon key), tidak pernah di-hardcode.
- Validasi input durasi sewa di sisi server (integer positif) untuk mencegah manipulasi countdown.
- Link WhatsApp memakai `wa.me` dengan nomor tervalidasi (digit internasional).

---

## 8. Deployment (Vercel)

1. Push repository ke GitHub → import di Vercel.
2. Set environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Jalankan migrasi SQL `supabase/migrations/` di dashboard Supabase.
4. Deploy otomatis pada setiap push ke `main`.

**Checklist pre-deploy**: skema + RLS aktif, seed data, `.env.local` tersedia, build `next build` sukses.

---

## 9. Ringkasan Keputusan Arsitektur (ADR Ringkas)

| Keputusan                          | Alternatif            | Alasan                                    |
| ---------------------------------- | --------------------- | ----------------------------------------- |
| Next.js + Tailwind                 | Vite + SPA            | SEO public web, routing & responsive bawaan |
| Supabase (BaaS)                    | Firebase              | PostgreSQL relasional sesuai skema PRD    |
| React Query                        | useEffect manual      | Cache + realtime countdown lebih mudah    |
| Countdown dihitung dari expiry_date| Dari payment_date     | Sesuai aturan akumulasi waktu di PRD      |
| Vercel                             | Netlify               | Integrasi seamless dengan Next.js         |
