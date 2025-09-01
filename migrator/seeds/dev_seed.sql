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

INSERT INTO event_types (id, name, category, system, description, component_area)
VALUES
    ('8f5c8c85-3f36-40c5-9e7f-90e05a6f7d6a', 'Wymiana oleju i filtra oleju', 'periodic_service', TRUE,
     'Zmniejszenie ryzyka awarii i wydłużenie żywotności silnika dzięki wymianie oleju.',
     'engine_and_lubrication_system'),

    ('dcd5d2a8-5738-41c1-9a14-b54b87788a3c', 'Regulacja układu wtryskowego', 'periodic_service', TRUE,
     'Optymalizacja spalania i niezawodności silnika dzięki regulacji układu wtryskowego',
     'engine_and_lubrication_system'),

    ('dbf91a8f-033d-42ab-8ae2-6a42626c2f8a', 'Wymiana filtra powietrza', 'periodic_service', TRUE,
     'Zapewnienie optymalnej pracy silnika i niższego zużycia paliwa dzięki wymianie filtra powietrza.',
     'engine_and_lubrication_system'),

    ('45c43f0f-d2bb-4a7c-b2a7-2d490a4f9df8', 'Wymiana klocków hamulcowych', 'periodic_service', TRUE,
     'Minimalizacja przestojów i zwiększenie bezpieczeństwa floty dzięki wymianie klocków hamulcowych.',
     'braking_system'),

    ('0a74a5d9-5f42-4cd4-8c5e-947e93e1a59c', 'Kalibracja mechatroniki skrzyni biegów', 'periodic_service', TRUE,
     'Zwiększenie niezawodności i ograniczenie przestojów floty dzięki kalibracji mechatroniki skrzyni biegów',
     'drivetrain'),

    ('88fcd12d-9ac2-4204-bf95-c1e72a24f3c6', 'Wymiana oleju w skrzyni biegów', 'periodic_service', TRUE,
     'Zabezpieczenie płynnej pracy skrzyni biegów i przedłużenie jej żywotności dzięki wymianie oleju.',
     'drivetrain'),

    ('edc52f54-d05d-4926-b30c-6e2e1c5b324a', 'Wymiana oleju w mostach', 'periodic_service', TRUE,
     'Zapewnienie niezawodnej pracy napędu i ochrony przekładni dzięki wymianie oleju w mostach.',
     'drivetrain'),

    ('b8dbf52d-78e6-4d9f-bd5b-4947a8f0244e', 'Wymiana filtra kabinowego', 'periodic_service', TRUE,
     'Poprawia jakość powietrza w kabinie, poprawia komfort pracy kierowcy',
     'cabin_and_equipment'),
    
    ('371e3c2f-7036-4471-a226-48d5c66ee32b', 'Wymiana turbiny', 'emergency_service', TRUE,
     'W przypadku awarii silnik traci moc i efektywność, konieczne aby uniknąć dalszych awarii',
     'engine_and_lubrication_system')
ON CONFLICT (id) DO NOTHING;


INSERT INTO event_intervals (id, vehicle_id, event_type_id, distance_interval_km, time_interval, warning_offset)
VALUES
    ('3f6b1c2e-5c3e-4b8e-9b1e-1c2d3e4f5a6b', '11111111-1111-1111-1111-111111111111', '8f5c8c85-3f36-40c5-9e7f-90e05a6f7d6a', NULL, INTERVAL '1 year', INTERVAL '30 day'),
    ('7a8b9c0d-e1f2-4a3b-8c9d-0e1f2a3b4c5d', '11111111-1111-1111-1111-111111111111', 'dcd5d2a8-5738-41c1-9a14-b54b87788a3c', 15000, INTERVAL '1 year', INTERVAL '30 day'),
    ('1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6', '11111111-1111-1111-1111-111111111111', 'dbf91a8f-033d-42ab-8ae2-6a42626c2f8a', 1000000, INTERVAL '10 year', INTERVAL '30 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, vehicle_id, event_type_id, event_date, event_mileage)
VALUES
    ('9e8f7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f', '11111111-1111-1111-1111-111111111111', '8f5c8c85-3f36-40c5-9e7f-90e05a6f7d6a', '2024-05-01', 10000),
    ('4b3c2d1e-0f9a-8b7c-6d5e-4f3a2b1c0d9e', '11111111-1111-1111-1111-111111111111', 'dcd5d2a8-5738-41c1-9a14-b54b87788a3c', '2024-06-01', 8000),
    ('2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', '11111111-1111-1111-1111-111111111111', 'dbf91a8f-033d-42ab-8ae2-6a42626c2f8a', '2024-06-01', 8000)
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
