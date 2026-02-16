-- Apartment Rental Management Database Schema
-- Multi-tenant architecture with Row Level Security (RLS)
-- Database: PostgreSQL (via Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CLIENTS TABLE (Multi-tenant root)
-- ============================================================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    logo_url TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);

-- ============================================================================
-- USERS TABLE (Links to Supabase auth.users)
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    avatar_url TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- BUILDINGS TABLE
-- ============================================================================
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    description TEXT,
    total_floors INTEGER DEFAULT 1,
    total_rooms INTEGER DEFAULT 0,
    year_built INTEGER,
    building_type VARCHAR(100) DEFAULT 'residential' CHECK (building_type IN ('residential', 'commercial', 'mixed')),
    amenities TEXT[], -- Array of amenities (e.g., parking, elevator, gym)
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'under_construction', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_buildings_client_id ON buildings(client_id);
CREATE INDEX idx_buildings_status ON buildings(status);
CREATE INDEX idx_buildings_city ON buildings(city);

-- ============================================================================
-- ROOMS TABLE
-- ============================================================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    floor_number INTEGER,
    room_type VARCHAR(100) DEFAULT 'studio' CHECK (room_type IN ('studio', '1bedroom', '2bedroom', '3bedroom', 'penthouse', 'other')),
    area_sqft DECIMAL(10, 2),
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    description TEXT,
    rent_amount DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    amenities TEXT[], -- Array of room-specific amenities
    image_urls TEXT[], -- Array of image URLs
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    available_from DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(building_id, room_number)
);

-- Indexes
CREATE INDEX idx_rooms_client_id ON rooms(client_id);
CREATE INDEX idx_rooms_building_id ON rooms(building_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_available_from ON rooms(available_from);

-- ============================================================================
-- TENANTS TABLE
-- ============================================================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    national_id VARCHAR(100),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    current_address TEXT,
    occupation VARCHAR(255),
    employer VARCHAR(255),
    monthly_income DECIMAL(10, 2),
    profile_image_url TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tenants_client_id ON tenants(client_id);
CREATE INDEX idx_tenants_email ON tenants(email);
CREATE INDEX idx_tenants_phone ON tenants(phone);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ============================================================================
-- LEASES TABLE
-- ============================================================================
CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lease_number VARCHAR(100) UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rent_amount DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2),
    payment_due_day INTEGER DEFAULT 1 CHECK (payment_due_day BETWEEN 1 AND 31),
    payment_frequency VARCHAR(50) DEFAULT 'monthly' CHECK (payment_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    contract_url TEXT, -- URL to signed lease document
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'renewed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (end_date > start_date)
);

-- Indexes
CREATE INDEX idx_leases_client_id ON leases(client_id);
CREATE INDEX idx_leases_room_id ON leases(room_id);
CREATE INDEX idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_leases_dates ON leases(start_date, end_date);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'credit_card', 'debit_card', 'mobile_payment', 'other')),
    transaction_reference VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'late', 'failed', 'refunded')),
    late_fee DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_lease_id ON payments(lease_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_dates ON payments(payment_date, due_date);

-- ============================================================================
-- MAINTENANCE REQUESTS TABLE
-- ============================================================================
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) CHECK (category IN ('plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest_control', 'cleaning', 'other')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    image_urls TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_maintenance_client_id ON maintenance_requests(client_id);
CREATE INDEX idx_maintenance_room_id ON maintenance_requests(room_id);
CREATE INDEX idx_maintenance_tenant_id ON maintenance_requests(tenant_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_priority ON maintenance_requests(priority);

-- ============================================================================
-- FUNCTION: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own client's users"
    ON users FOR SELECT
    USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (id = auth.uid());

-- Buildings table policies
CREATE POLICY "Users can view their own client's buildings"
    ON buildings FOR SELECT
    USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins and managers can insert buildings"
    ON buildings FOR INSERT
    WITH CHECK (
        client_id IN (SELECT client_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

CREATE POLICY "Admins and managers can update buildings"
    ON buildings FOR UPDATE
    USING (
        client_id IN (SELECT client_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

CREATE POLICY "Admins can delete buildings"
    ON buildings FOR DELETE
    USING (
        client_id IN (SELECT client_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Rooms table policies
CREATE POLICY "Users can view their own client's rooms"
    ON rooms FOR SELECT
    USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins and managers can insert rooms"
    ON rooms FOR INSERT
    WITH CHECK (
        client_id IN (SELECT client_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

CREATE POLICY "Admins and managers can update rooms"
    ON rooms FOR UPDATE
    USING (
        client_id IN (SELECT client_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

CREATE POLICY "Admins can delete rooms"
    ON rooms FOR DELETE
    USING (
        client_id IN (SELECT client_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Tenants table policies
CREATE POLICY "Users can view their own client's tenants"
    ON tenants FOR SELECT
    USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins and managers can manage tenants"
    ON tenants FOR ALL
    USING (
        client_id IN (SELECT client_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- Leases table policies
CREATE POLICY "Users can view their own client's leases"
    ON leases FOR SELECT
    USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins and managers can manage leases"
    ON leases FOR ALL
    USING (
        client_id IN (SELECT client_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- Payments table policies
CREATE POLICY "Users can view their own client's payments"
    ON payments FOR SELECT
    USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins and managers can manage payments"
    ON payments FOR ALL
    USING (
        client_id IN (SELECT client_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- Maintenance requests table policies
CREATE POLICY "Users can view their own client's maintenance requests"
    ON maintenance_requests FOR SELECT
    USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "All users can create maintenance requests"
    ON maintenance_requests FOR INSERT
    WITH CHECK (
        client_id IN (SELECT client_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins and managers can update maintenance requests"
    ON maintenance_requests FOR UPDATE
    USING (
        client_id IN (SELECT client_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- ============================================================================
-- VIEWS for common queries
-- ============================================================================

-- View: Active Leases with Room and Tenant Details
CREATE VIEW active_leases_view AS
SELECT 
    l.id,
    l.client_id,
    l.lease_number,
    l.start_date,
    l.end_date,
    l.rent_amount,
    l.status,
    t.first_name || ' ' || t.last_name AS tenant_name,
    t.phone AS tenant_phone,
    t.email AS tenant_email,
    b.name AS building_name,
    r.room_number,
    r.floor_number
FROM leases l
JOIN tenants t ON l.tenant_id = t.id
JOIN rooms r ON l.room_id = r.id
JOIN buildings b ON r.building_id = b.id
WHERE l.status = 'active';

-- View: Available Rooms
CREATE VIEW available_rooms_view AS
SELECT 
    r.id,
    r.client_id,
    r.room_number,
    r.floor_number,
    r.room_type,
    r.area_sqft,
    r.bedrooms,
    r.bathrooms,
    r.rent_amount,
    r.available_from,
    b.name AS building_name,
    b.address AS building_address,
    b.city AS building_city
FROM rooms r
JOIN buildings b ON r.building_id = b.id
WHERE r.status = 'available';

-- View: Outstanding Payments
CREATE VIEW outstanding_payments_view AS
SELECT 
    p.id,
    p.client_id,
    p.due_date,
    p.amount,
    p.late_fee,
    p.status,
    l.lease_number,
    t.first_name || ' ' || t.last_name AS tenant_name,
    t.phone AS tenant_phone,
    r.room_number,
    b.name AS building_name
FROM payments p
JOIN leases l ON p.lease_id = l.id
JOIN tenants t ON l.tenant_id = t.id
JOIN rooms r ON l.room_id = r.id
JOIN buildings b ON r.building_id = b.id
WHERE p.status IN ('pending', 'late', 'partial');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE clients IS 'Multi-tenant root table for different organizations';
COMMENT ON TABLE users IS 'Application users linked to Supabase auth.users';
COMMENT ON TABLE buildings IS 'Buildings owned by clients';
COMMENT ON TABLE rooms IS 'Rental units/apartments within buildings';
COMMENT ON TABLE tenants IS 'People renting the rooms';
COMMENT ON TABLE leases IS 'Rental agreements between tenants and rooms';
COMMENT ON TABLE payments IS 'Rent payments made by tenants';
COMMENT ON TABLE maintenance_requests IS 'Maintenance and repair requests';
