INSERT INTO users (first_name, last_name, role, email, password_hash) 
VALUES (
    'Jan', 
    'Kowalski', 
    'admin', 
    'jan.kowalski@example.com', 
    '$2a$10$qiP30Od/V/uBpxf0gfUi..HvUqVpJNQ8Lfvgo3CzPn9NzQzZS71u.' -- "admin"
) ON CONFLICT (email) DO NOTHING;

INSERT INTO vehicles (id, brand, model, vin, registration_number, type) 
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Volvo', 'FMX', '1G1AF1F57A7192174', 'WGM1988J', 'semitruck'), 
    ('22222222-2222-2222-2222-222222222222', 'Volvo', 'FMX', '2FMDK36C58BA12345', 'WGM59883', 'semitruck'), 
    ('33333333-3333-3333-3333-333333333333', 'Volvo', 'FH Aero', '3VW2K7AJ5FM123456', 'WGM8988C', 'semitruck'), 
    ('44444444-4444-4444-4444-444444444444', 'Volvo', 'FH16', '4T1BF1FK0GU123456', 'WGM59882', 'semitruck'), 
    ('55555555-5555-5555-5555-555555555555', 'Volvo', 'FH Aero', '5N1AR2MN8FC123456', 'WGM6482H', 'semitruck')
ON CONFLICT (registration_number) DO NOTHING;

INSERT INTO event_types (id, name, default_cost_category)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Przegląd techniczny', 'service'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Serwis olejowy', 'service'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Kolizja', 'service')
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '', 'service')
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_intervals (id, vehicle_id, event_type_id, distance_interval_km, time_interval, warning_offset)
VALUES
    ('3f6b1c2e-5c3e-4b8e-9b1e-1c2d3e4f5a6b', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, INTERVAL '1 year', INTERVAL '30 day'),
    ('7a8b9c0d-e1f2-4a3b-8c9d-0e1f2a3b4c5d', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 15000, INTERVAL '1 year', INTERVAL '30 day'),
    ('1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1000000, INTERVAL '10 year', INTERVAL '30 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, vehicle_id, event_type_id, event_date, event_mileage)
VALUES
    ('9e8f7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-05-01', 10000),
    ('4b3c2d1e-0f9a-8b7c-6d5e-4f3a2b1c0d9e', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-06-01', 8000),
    ('2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-06-01', 8000)
ON CONFLICT (id) DO NOTHING;
WITH veh AS (
  SELECT id AS vehicle_id FROM vehicles LIMIT 1
)
INSERT INTO revenues (
    value,
    vat_rate,
    vat_value,
    currency,
    value_main_currency,
    vat_value_main_currency,
    vehicle_id,
    title,
    invoice_date,
    revenue_date
)
SELECT
    1500.00,
    23.00,
    345.00,
    'PLN',
    1500.00,
    345.00,
    veh.vehicle_id,
    'Usługa serwisowa',
    '2025-06-20'::DATE,
    '2025-06-21'::DATE
FROM veh
UNION ALL
SELECT
    300.00,
    8.00,
    24.00,
    'EUR',
    1300.00,
    104.00,
    veh.vehicle_id,
    'Wynajem pojazdu',
    '2025-05-10'::DATE,
    '2025-05-10'::DATE
FROM veh
UNION ALL
SELECT
    750.00,
    0.00,
    0.00,
    'USD',
    2900.00,
    0.00,
    veh.vehicle_id,
    'Transport międzynarodowy',
    '2025-07-01'::DATE,
    '2025-07-01'::DATE
FROM veh;
