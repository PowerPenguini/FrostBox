INSERT INTO users (first_name, last_name, role, email, password_hash) 
VALUES (
    'Jan', 
    'Kowalski', 
    'admin', 
    'jan.kowalski@example.com', 
    '$2a$10$qiP30Od/V/uBpxf0gfUi..HvUqVpJNQ8Lfvgo3CzPn9NzQzZS71u.' -- Hash hasła "securepassword"
);


INSERT INTO vehicles (id, registration_number) 
VALUES 
    (uuid_generate_v4(), 'WGM1988J'), 
    (uuid_generate_v4(), 'WGM59883'), 
    (uuid_generate_v4(), 'WGM8988C'), 
    (uuid_generate_v4(), 'WGM59882'), 
    (uuid_generate_v4(), 'WGM6482H')
ON CONFLICT (registration_number) DO NOTHING;
