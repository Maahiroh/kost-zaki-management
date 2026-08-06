-- Safe ENUM creation
DO $$ BEGIN
    CREATE TYPE room_status_type AS ENUM ('Kosong', 'Terisi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table: rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(50) UNIQUE NOT NULL,
  status room_status_type DEFAULT 'Kosong',
  price_monthly NUMERIC DEFAULT 750000,
  floor INTEGER DEFAULT 1,
  type VARCHAR(100) DEFAULT 'Standard',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE UNIQUE,
  name VARCHAR(255) NOT NULL,
  whatsapp_number VARCHAR(50) NOT NULL,
  entry_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: payment_logs
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_months INTEGER NOT NULL,
  amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  tenant_name VARCHAR(255) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  amount NUMERIC,
  duration_months INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: settings (WiFi, QRIS, App Config)
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: gallery_photos
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Fasilitas',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflict
DROP POLICY IF EXISTS "Allow public all rooms" ON rooms;
DROP POLICY IF EXISTS "Allow public all tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public all payment_logs" ON payment_logs;
DROP POLICY IF EXISTS "Allow public all activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Allow public all settings" ON settings;
DROP POLICY IF EXISTS "Allow public all gallery_photos" ON gallery_photos;

-- Create Public/Anon access policies
CREATE POLICY "Allow public all rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all tenants" ON tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all payment_logs" ON payment_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all settings" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all gallery_photos" ON gallery_photos FOR ALL USING (true) WITH CHECK (true);

-- Seed initial 5 rooms
INSERT INTO rooms (room_number, status, price_monthly, floor, type)
VALUES
  ('101', 'Kosong', 750000, 1, 'Standard'),
  ('102', 'Kosong', 750000, 1, 'Standard'),
  ('103', 'Kosong', 750000, 1, 'Standard'),
  ('104', 'Kosong', 750000, 1, 'Standard'),
  ('105', 'Kosong', 750000, 1, 'Standard')
ON CONFLICT (room_number) DO NOTHING;

-- Seed initial settings
INSERT INTO settings (key, value)
VALUES
  ('wifi_info', '{"ssid": "Kost Zaki Wetan Mantras", "password": "wetanmantras123"}'::jsonb),
  ('qris_image', '"/qris-default.svg"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Seed initial gallery photo
INSERT INTO gallery_photos (title, url, category)
VALUES
  ('Foto Kos', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', 'Kos')
ON CONFLICT DO NOTHING;
