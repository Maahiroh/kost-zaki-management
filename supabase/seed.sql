-- Seed data for rooms
INSERT INTO rooms (room_number, status, price_monthly, floor, type) VALUES
('101', 'Terisi', 1500000, 1, 'Standard AC'),
('102', 'Kosong', 1500000, 1, 'Standard AC'),
('103', 'Terisi', 1500000, 1, 'Standard AC'),
('104', 'Kosong', 1500000, 1, 'Standard AC'),
('201', 'Terisi', 1700000, 2, 'Deluxe Balon'),
('202', 'Kosong', 1700000, 2, 'Deluxe Balon'),
('203', 'Kosong', 1700000, 2, 'Deluxe Balon'),
('204', 'Terisi', 1700000, 2, 'Deluxe Balon');

-- Seed tenants
INSERT INTO tenants (room_id, name, whatsapp_number, expiry_date)
SELECT id, 'Budi Santoso', '081234567890', NOW() + INTERVAL '15 days' FROM rooms WHERE room_number = '101';

INSERT INTO tenants (room_id, name, whatsapp_number, expiry_date)
SELECT id, 'Siti Rahma', '082198765432', NOW() + INTERVAL '4 days' FROM rooms WHERE room_number = '103';

INSERT INTO tenants (room_id, name, whatsapp_number, expiry_date)
SELECT id, 'Andi Wijaya', '085711223344', NOW() + INTERVAL '45 days' FROM rooms WHERE room_number = '201';

INSERT INTO tenants (room_id, name, whatsapp_number, expiry_date)
SELECT id, 'Dewi Lestari', '089655443322', NOW() - INTERVAL '2 days' FROM rooms WHERE room_number = '204';
