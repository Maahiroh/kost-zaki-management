-- Create ENUM status
CREATE TYPE room_status_type AS ENUM ('Kosong', 'Terisi');

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

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon access for application CRUD
CREATE POLICY "Allow public all rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all tenants" ON tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all payment_logs" ON payment_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);

-- Seed initial 5 rooms if table is empty
INSERT INTO rooms (room_number, status, price_monthly, floor, type)
VALUES
  ('101', 'Kosong', 750000, 1, 'Standard'),
  ('102', 'Kosong', 750000, 1, 'Standard'),
  ('103', 'Kosong', 750000, 1, 'Standard'),
  ('104', 'Kosong', 750000, 1, 'Standard'),
  ('105', 'Kosong', 750000, 1, 'Standard')
ON CONFLICT (room_number) DO NOTHING;
