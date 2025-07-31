INSERT INTO
    users (first_name, last_name, role, email, password_hash)
VALUES
    (
        'Jan',
        'Kowalski',
        'admin',
        'jan.kowalski@example.com',
        '$2a$10$qiP30Od/V/uBpxf0gfUi..HvUqVpJNQ8Lfvgo3CzPn9NzQzZS71u.' -- Hash hasła "securepassword"
    );

INSERT INTO event_types (id, name, category, system)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Przegląd techniczny', 'service', TRUE),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Serwis olejowy', 'service', TRUE),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Kolizja', 'service', TRUE),
ON CONFLICT (id) DO NOTHING;