-- Create ENUM status
CREATE TYPE room_status_type AS ENUM ('Kosong', 'Terisi');

-- Table: rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(50) UNIQUE NOT NULL,
  status room_status_type DEFAULT 'Kosong',
  price_monthly NUMERIC DEFAULT 750000,
  floor INTEGER DEFAULT 1,
  type VARCHAR(100) DEFAULT 'Standard',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE UNIQUE,
  name VARCHAR(255) NOT NULL,
  whatsapp_number VARCHAR(50) NOT NULL,
  entry_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: payment_logs
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_months INTEGER NOT NULL,
  amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: activity_logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 'pembayaran' | 'check_in' | 'check_out'
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

-- Public Policy: Anyone can view rooms availability
CREATE POLICY "Public rooms view" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public tenants view" ON tenants FOR SELECT USING (true);

-- Admin Full Access Policy
CREATE POLICY "Admin full rooms" ON rooms FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full tenants" ON tenants FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full payment_logs" ON payment_logs FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full activity_logs" ON activity_logs FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Tenant RLS Policy (Tenant ONLY views personal activity logs)
CREATE POLICY "Tenant view personal activity_logs" ON activity_logs 
  FOR SELECT 
  USING (
    (auth.jwt() ->> 'role' = 'tenant' AND tenant_name = (auth.jwt() ->> 'email'))
    OR (auth.jwt() ->> 'role' = 'admin')
  );
