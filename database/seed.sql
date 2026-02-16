-- Seed data for Apartment Rental Management System
-- This script provides sample data for development and testing

-- ============================================================================
-- CLIENTS (Sample organizations)
-- ============================================================================
INSERT INTO clients (id, name, email, phone, address, city, state, country, postal_code, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Premium Property Management', 'contact@premiumpm.com', '+1-555-0100', '123 Business St', 'New York', 'NY', 'USA', '10001', 'active'),
    ('22222222-2222-2222-2222-222222222222', 'Sunrise Realty Group', 'info@sunriserealty.com', '+1-555-0200', '456 Real Estate Ave', 'Los Angeles', 'CA', 'USA', '90001', 'active'),
    ('33333333-3333-3333-3333-333333333333', 'Urban Living Properties', 'hello@urbanliving.com', '+1-555-0300', '789 Downtown Blvd', 'Chicago', 'IL', 'USA', '60601', 'active');

-- ============================================================================
-- BUILDINGS
-- ============================================================================
INSERT INTO buildings (id, client_id, name, address, city, state, country, postal_code, description, total_floors, total_rooms, year_built, building_type, amenities, status) VALUES
    -- Premium Property Management Buildings
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Manhattan Heights', '100 Park Avenue', 'New York', 'NY', 'USA', '10016', 'Luxury apartment building in the heart of Manhattan', 15, 60, 2018, 'residential', ARRAY['parking', 'elevator', 'gym', 'pool', 'concierge', 'rooftop'], 'active'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '11111111-1111-1111-1111-111111111111', 'Brooklyn View Apartments', '500 Brooklyn Bridge Blvd', 'Brooklyn', 'NY', 'USA', '11201', 'Modern apartments with stunning views', 10, 40, 2020, 'residential', ARRAY['parking', 'elevator', 'gym', 'bike_storage'], 'active'),
    
    -- Sunrise Realty Group Buildings
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Santa Monica Beach Residence', '200 Ocean Drive', 'Santa Monica', 'CA', 'USA', '90401', 'Beachfront luxury living', 8, 32, 2019, 'residential', ARRAY['parking', 'elevator', 'pool', 'beach_access', 'gym'], 'active'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', '22222222-2222-2222-2222-222222222222', 'Downtown LA Lofts', '350 S Spring Street', 'Los Angeles', 'CA', 'USA', '90013', 'Modern loft-style apartments', 12, 48, 2021, 'mixed', ARRAY['parking', 'elevator', 'coworking', 'gym'], 'active'),
    
    -- Urban Living Properties Buildings
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Chicago Loop Tower', '75 E Wacker Drive', 'Chicago', 'IL', 'USA', '60601', 'High-rise apartments in the Loop', 20, 80, 2017, 'residential', ARRAY['parking', 'elevator', 'gym', 'pool', 'business_center'], 'active');

-- ============================================================================
-- ROOMS
-- ============================================================================
INSERT INTO rooms (id, client_id, building_id, room_number, floor_number, room_type, area_sqft, bedrooms, bathrooms, description, rent_amount, deposit_amount, amenities, status, available_from) VALUES
    -- Manhattan Heights (Building A)
    ('00000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '101', 1, 'studio', 550.00, 0, 1, 'Cozy studio with city view', 2500.00, 2500.00, ARRAY['balcony', 'hardwood_floors'], 'available', '2024-03-01'),
    ('00000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '201', 2, '1bedroom', 750.00, 1, 1, 'Spacious one bedroom apartment', 3200.00, 3200.00, ARRAY['balcony', 'dishwasher', 'in_unit_laundry'], 'occupied', NULL),
    ('00000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '301', 3, '2bedroom', 1100.00, 2, 2, 'Modern two bedroom with great views', 4500.00, 4500.00, ARRAY['balcony', 'dishwasher', 'in_unit_laundry', 'walk_in_closet'], 'occupied', NULL),
    ('00000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1501', 15, 'penthouse', 2500.00, 3, 3, 'Luxury penthouse with panoramic views', 12000.00, 24000.00, ARRAY['terrace', 'fireplace', 'smart_home', 'wine_fridge'], 'available', '2024-04-01'),
    
    -- Brooklyn View Apartments (Building A)
    ('00000001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '102', 1, 'studio', 500.00, 0, 1, 'Affordable studio apartment', 1800.00, 1800.00, ARRAY['hardwood_floors'], 'available', '2024-03-15'),
    ('00000001-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '502', 5, '2bedroom', 950.00, 2, 1, 'Two bedroom with bridge views', 3000.00, 3000.00, ARRAY['balcony', 'dishwasher'], 'occupied', NULL),
    
    -- Santa Monica Beach Residence (Building B)
    ('00000002-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '201', 2, '1bedroom', 800.00, 1, 1, 'Beach view one bedroom', 4200.00, 4200.00, ARRAY['balcony', 'ocean_view', 'dishwasher'], 'occupied', NULL),
    ('00000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '301', 3, '2bedroom', 1200.00, 2, 2, 'Spacious beachfront apartment', 6500.00, 6500.00, ARRAY['balcony', 'ocean_view', 'dishwasher', 'in_unit_laundry'], 'available', '2024-04-15'),
    
    -- Downtown LA Lofts (Building B)
    ('00000002-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', '405', 4, '1bedroom', 900.00, 1, 1, 'Modern loft with high ceilings', 3500.00, 3500.00, ARRAY['exposed_brick', 'high_ceilings', 'dishwasher'], 'available', '2024-03-20'),
    ('00000002-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', '805', 8, '2bedroom', 1300.00, 2, 2, 'Two bedroom loft apartment', 4800.00, 4800.00, ARRAY['exposed_brick', 'high_ceilings', 'dishwasher', 'city_view'], 'occupied', NULL),
    
    -- Chicago Loop Tower (Building C)
    ('00000003-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '1005', 10, '1bedroom', 850.00, 1, 1, 'Downtown Chicago apartment', 2800.00, 2800.00, ARRAY['balcony', 'city_view', 'dishwasher'], 'occupied', NULL),
    ('00000003-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '1505', 15, '2bedroom', 1150.00, 2, 2, 'High floor two bedroom', 3800.00, 3800.00, ARRAY['balcony', 'city_view', 'dishwasher', 'in_unit_laundry'], 'available', '2024-05-01');

-- ============================================================================
-- TENANTS
-- ============================================================================
INSERT INTO tenants (id, client_id, first_name, last_name, email, phone, date_of_birth, occupation, employer, monthly_income, status) VALUES
    -- Premium Property Management Tenants
    ('ffffffff-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'John', 'Smith', 'john.smith@email.com', '+1-555-1001', '1985-05-15', 'Software Engineer', 'Tech Corp', 8500.00, 'active'),
    ('ffffffff-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Sarah', 'Johnson', 'sarah.j@email.com', '+1-555-1002', '1990-08-22', 'Marketing Manager', 'Brand Inc', 7200.00, 'active'),
    ('ffffffff-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Michael', 'Brown', 'mbrown@email.com', '+1-555-1003', '1988-03-10', 'Financial Analyst', 'Finance Group', 9500.00, 'active'),
    
    -- Sunrise Realty Group Tenants
    ('ffffffff-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Emily', 'Davis', 'emily.davis@email.com', '+1-555-2001', '1992-12-05', 'Graphic Designer', 'Creative Studio', 5800.00, 'active'),
    ('ffffffff-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'David', 'Wilson', 'dwilson@email.com', '+1-555-2002', '1987-07-18', 'Real Estate Agent', 'Property Sales Inc', 8200.00, 'active'),
    
    -- Urban Living Properties Tenants
    ('ffffffff-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', 'Jennifer', 'Martinez', 'j.martinez@email.com', '+1-555-3001', '1995-09-25', 'Teacher', 'Public School District', 5500.00, 'active');

-- ============================================================================
-- LEASES
-- ============================================================================
INSERT INTO leases (id, client_id, room_id, tenant_id, lease_number, start_date, end_date, rent_amount, deposit_amount, payment_due_day, status) VALUES
    -- Active leases
    ('eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '00000001-0000-0000-0000-000000000002', 'ffffffff-0000-0000-0000-000000000001', 'L-2023-001', '2023-06-01', '2024-05-31', 3200.00, 3200.00, 1, 'active'),
    ('eeeeeeee-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '00000001-0000-0000-0000-000000000003', 'ffffffff-0000-0000-0000-000000000002', 'L-2023-002', '2023-07-15', '2024-07-14', 4500.00, 4500.00, 15, 'active'),
    ('eeeeeeee-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '00000001-0000-0000-0000-000000000006', 'ffffffff-0000-0000-0000-000000000003', 'L-2023-003', '2023-08-01', '2024-07-31', 3000.00, 3000.00, 1, 'active'),
    ('eeeeeeee-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', '00000002-0000-0000-0000-000000000001', 'ffffffff-0000-0000-0000-000000000004', 'L-2023-101', '2023-09-01', '2024-08-31', 4200.00, 4200.00, 1, 'active'),
    ('eeeeeeee-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', '00000002-0000-0000-0000-000000000004', 'ffffffff-0000-0000-0000-000000000005', 'L-2023-102', '2023-10-01', '2024-09-30', 4800.00, 4800.00, 1, 'active'),
    ('eeeeeeee-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', '00000003-0000-0000-0000-000000000001', 'ffffffff-0000-0000-0000-000000000006', 'L-2023-201', '2023-11-01', '2024-10-31', 2800.00, 2800.00, 1, 'active');

-- ============================================================================
-- PAYMENTS
-- ============================================================================
INSERT INTO payments (id, client_id, lease_id, payment_date, due_date, amount, payment_method, status) VALUES
    -- Past payments (Paid)
    ('dddddddd-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-0000-0000-0000-000000000001', '2023-12-28', '2024-01-01', 3200.00, 'bank_transfer', 'paid'),
    ('dddddddd-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-0000-0000-0000-000000000002', '2024-01-10', '2024-01-15', 4500.00, 'check', 'paid'),
    ('dddddddd-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-0000-0000-0000-000000000004', '2023-12-30', '2024-01-01', 4200.00, 'bank_transfer', 'paid'),
    
    -- Current month payments (Some pending)
    ('dddddddd-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-0000-0000-0000-000000000001', '2024-01-29', '2024-02-01', 3200.00, 'bank_transfer', 'paid'),
    ('dddddddd-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-0000-0000-0000-000000000002', NULL, '2024-02-15', 4500.00, NULL, 'pending'),
    ('dddddddd-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-0000-0000-0000-000000000003', '2024-02-03', '2024-02-01', 3000.00, 'credit_card', 'late'),
    ('dddddddd-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-0000-0000-0000-000000000004', NULL, '2024-02-01', 4200.00, NULL, 'pending'),
    ('dddddddd-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-0000-0000-0000-000000000005', '2024-01-30', '2024-02-01', 4800.00, 'bank_transfer', 'paid'),
    ('dddddddd-0000-0000-0000-000000000009', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-0000-0000-0000-000000000006', NULL, '2024-02-01', 2800.00, NULL, 'pending');

-- ============================================================================
-- MAINTENANCE REQUESTS
-- ============================================================================
INSERT INTO maintenance_requests (id, client_id, room_id, tenant_id, title, description, category, priority, status, reported_date) VALUES
    ('cccccccc-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '00000001-0000-0000-0000-000000000002', 'ffffffff-0000-0000-0000-000000000001', 'Leaking Kitchen Faucet', 'The kitchen faucet has been leaking for the past few days', 'plumbing', 'medium', 'open', '2024-02-10 09:30:00'),
    ('cccccccc-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '00000001-0000-0000-0000-000000000003', 'ffffffff-0000-0000-0000-000000000002', 'AC Not Cooling', 'Air conditioning unit not producing cold air', 'hvac', 'high', 'in_progress', '2024-02-12 14:15:00'),
    ('cccccccc-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', '00000002-0000-0000-0000-000000000001', 'ffffffff-0000-0000-0000-000000000004', 'Light Fixture Broken', 'Bathroom light fixture needs replacement', 'electrical', 'low', 'completed', '2024-02-05 10:00:00'),
    ('cccccccc-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', '00000003-0000-0000-0000-000000000001', 'ffffffff-0000-0000-0000-000000000006', 'Dishwasher Not Working', 'Dishwasher stops mid-cycle', 'appliance', 'medium', 'open', '2024-02-14 16:45:00');

-- ============================================================================
-- NOTES
-- ============================================================================
-- This seed data provides:
-- - 3 different clients (organizations)
-- - 5 buildings across different cities
-- - 12 rooms with varying types and statuses
-- - 6 tenants
-- - 6 active leases
-- - 9 payments (mix of paid, pending, and late)
-- - 4 maintenance requests with different statuses
--
-- The data is set up to test multi-tenancy:
-- - Each client has their own buildings, rooms, and tenants
-- - RLS policies will ensure data isolation
-- - Different scenarios are covered (available rooms, active leases, pending payments)
