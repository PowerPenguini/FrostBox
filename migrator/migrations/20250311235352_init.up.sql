CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('driver', 'manager', 'admin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role user_role NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE costs (
    id SERIAL PRIMARY KEY,
    value DECIMAL(10, 2) NOT NULL,
    source VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,6) NOT NULL,
    car_id UUID NOT NULL,
    vat_rate DECIMAL(5, 2) NOT NULL,
    vat_value DECIMAL(10, 2) NOT NULL,
    title VARCHAR(255) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    category VARCHAR(255) NOT NULL,
    country VARCHAR(3) NOT NULL,
    invoice_date DATE NOT NULL,
    cost_date DATE NOT NULL
);


CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL UNIQUE
);
