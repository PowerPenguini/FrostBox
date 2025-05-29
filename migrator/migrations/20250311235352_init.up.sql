CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('driver', 'manager', 'admin');

CREATE TYPE document_status AS ENUM ('withdrawn', 'added', 'incorrect');

CREATE TYPE cost_category AS ENUM ('fuel', 'additive', 'toll', 'service', 'other');


CREATE TABLE
    users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        role user_role NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        readable_id VARCHAR(8) NOT NULL UNIQUE,
        status document_status NOT NULL,
        source VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    vehicles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vin VARCHAR(255) NOT NULL UNIQUE,
        brand VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        registration_number VARCHAR(20) NOT NULL UNIQUE
    );

CREATE TABLE
    costs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        value DECIMAL(16, 2) NOT NULL,
        vat_rate DECIMAL(5, 2) NOT NULL,
        vat_value DECIMAL(16, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        value_main_currency DECIMAL(16, 8) NOT NULL,
        vat_value_main_currency DECIMAL(16, 8) NOT NULL,
        quantity DECIMAL(16, 8) NOT NULL,
        vehicle_id UUID,
        title VARCHAR(255) NOT NULL,
        category cost_category NOT NULL,
        country VARCHAR(3) NOT NULL,
        invoice_date DATE NOT NULL,
        cost_date DATE NOT NULL,
        document_id UUID,
        amortization INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
    );

CREATE TABLE
    revenues (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        value DECIMAL(16, 2) NOT NULL,
        vat_rate DECIMAL(5, 2) NOT NULL,
        vat_value DECIMAL(16, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        value_main_currency DECIMAL(16, 8) NOT NULL,
        vat_value_main_currency DECIMAL(16, 8) NOT NULL,
        vehicle_id UUID,
        title VARCHAR(255) NOT NULL,
        invoice_date DATE NOT NULL,
        revenue_date DATE NOT NULL,
        document_id UUID,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
    );

CREATE TABLE
    event_types (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        default_cost_category cost_category NOT NULL -- max counter unitl waringing/ reccesive type - 
    );

CREATE TABLE
    event_intervals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vehicle_id UUID NOT NULL REFERENCES vehicles (id) ON DELETE CASCADE,
        event_type_id UUID NOT NULL REFERENCES event_types (id) ON DELETE CASCADE,
        distance_interval_km INT,
        time_interval INTERVAL,
        warning_offset INTERVAL NOT NULL -- km/data // Counter
    );

CREATE TABLE
    events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vehicle_id UUID NOT NULL REFERENCES vehicles (id) ON DELETE CASCADE,
        event_type_id UUID NOT NULL REFERENCES event_types (id) ON DELETE CASCADE,
        event_date DATE NOT NULL,
        event_mileage INT,
        cost_id UUID,
        FOREIGN KEY (cost_id) REFERENCES costs (id) ON DELETE CASCADE
    );