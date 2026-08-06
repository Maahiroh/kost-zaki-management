# PRD Sistem Manajemen Kos (Web Umum & Admin)

## 1. Ringkasan Produk
Aplikasi berbasis web (mobile-responsive) untuk mengelola operasional kos. Terdiri dari halaman Public Web sebagai etalase informasi kos, serta portal login khusus untuk Admin (Pemilik) dan Penyewa untuk manajemen kamar dan tagihan.

## 2. Arsitektur & Teknologi (Sederhana)
 Frontend React.js  Next.js + Tailwind CSS.
 Backend & Database Supabase atau Firebase (BaaS).
 Hosting Vercel atau Netlify.

## 3. Fitur Utama & Navigasi

### A. Web Umum (Public Facing)
 Informasi Kos Menampilkan fasilitas umum dan harga sewa standar.
 Ketersediaan Kamar Menampilkan indikator angka kamar yang kosong secara real-time (diambil otomatis dari hitungan status Kosong di database).
 Portal Login Pintu masuk (gateway) untuk Admin dan Penyewa.

### B. Dashboard Admin
1. Manajemen Kamar
   - Menampilkan daftar semua nomor kamar.
   - Status kamar Kosong atau Terisi.
   - Jika Terisi, tampilkan Nama Penyewa dan TombolLink WA (`wa.menomor`) untuk fast response.
2. Log Pembayaran & Countdown Sewa
   - Admin dapat mencatat pembayaran dengan memilih opsi Durasi Sewa (misal 1 bulan, 3 bulan).
   - Logika Countdown (Akumulasi Waktu) Jika penyewa membayar sebelum masa aktif habis, durasi baru akan ditambahkan dari tanggal jatuh tempo sebelumnya, BUKAN dari tanggal pembayaran. (Contoh Jatuh tempo tgl 7, bayar tgl 1. Masa aktif baru dihitung dari tgl 7 + durasi sewa).
   - Menampilkan sisa hariwaktu mundur masa sewa per kamar.

## 4. Skema Database (Relasional Sederhana)

 Table `rooms` (Kamar)
  - `id` (UUID)
  - `room_number` (StringNumber)
  - `status` (EnumString 'Kosong', 'Terisi')

 Table `tenants` (Penyewa)
  - `id` (UUID)
  - `room_id` (Relasi ke rooms.id)
  - `name` (String)
  - `whatsapp_number` (String)
  - `expiry_date` (TimestampDate) - Digunakan untuk fitur Countdown

 Table `payment_logs` (Riwayat Pembayaran)
  - `id` (UUID)
  - `tenant_id` (Relasi ke tenants.id)
  - `payment_date` (Timestamp)
  - `duration_months` (Number)