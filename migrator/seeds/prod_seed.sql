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

INSERT INTO
    event_types (name, default_cost_category)
VALUES
    ('Przegląd techniczny', 'service'),
    ('Serwis olejowy', 'service'),
    ('Wymiana płynu chłodniczego', 'service') ON CONFLICT (id) DO NOTHING;