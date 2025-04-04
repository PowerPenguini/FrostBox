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
    (uuid_generate_v4(), 'Volvo', 'FMX', '1G1AF1F57A7192174', 'WGM1988J'), 
    (uuid_generate_v4(), 'Volvo', 'FMX', '2FMDK36C58BA12345', 'WGM59883'), 
    (uuid_generate_v4(), 'Volvo', 'FH Aero', '3VW2K7AJ5FM123456' , 'WGM8988C'), 
    (uuid_generate_v4(), 'Volvo', 'FH16', '4T1BF1FK0GU123456', 'WGM59882'), 
    (uuid_generate_v4(), 'Volvo', 'FH Aero', '5N1AR2MN8FC123456', 'WGM6482H')
ON CONFLICT (registration_number) DO NOTHING;
