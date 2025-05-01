INSERT INTO users (first_name, last_name, role, email, password_hash) 
VALUES (
    'Jan', 
    'Kowalski', 
    'admin', 
    'jan.kowalski@example.com', 
    '$2a$10$qiP30Od/V/uBpxf0gfUi..HvUqVpJNQ8Lfvgo3CzPn9NzQzZS71u.' -- "admin"
) ON CONFLICT (email) DO NOTHING;

INSERT INTO vehicles (id, brand, model, vin, registration_number) 
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Volvo', 'FMX', '1G1AF1F57A7192174', 'WGM1988J'), 
    ('22222222-2222-2222-2222-222222222222', 'Volvo', 'FMX', '2FMDK36C58BA12345', 'WGM59883'), 
    ('33333333-3333-3333-3333-333333333333', 'Volvo', 'FH Aero', '3VW2K7AJ5FM123456', 'WGM8988C'), 
    ('44444444-4444-4444-4444-444444444444', 'Volvo', 'FH16', '4T1BF1FK0GU123456', 'WGM59882'), 
    ('55555555-5555-5555-5555-555555555555', 'Volvo', 'FH Aero', '5N1AR2MN8FC123456', 'WGM6482H')
ON CONFLICT (registration_number) DO NOTHING;

INSERT INTO event_types (id, name)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Przegląd techniczny'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Serwis olejowy')
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_intervals (id, name, vehicle_id, event_type_id, distance_interval_km, time_interval)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 20000, INTERVAL '1 year'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 15000, INTERVAL '1 year')
ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, vehicle_id, event_type_id, event_date, odometer_km, event_interval_id)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-05-01', 10000, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-06-01', 8000, 'dddddddd-dddd-dddd-dddd-dddddddddddd')
ON CONFLICT (id) DO NOTHING;