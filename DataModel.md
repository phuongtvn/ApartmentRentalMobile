# Data Model Documentation

## Overview

This document provides a comprehensive overview of the data model used in the Apartment Rental Management Mobile Application. The application uses a multi-tenant architecture with PostgreSQL (via Supabase) as the database, implementing Row Level Security (RLS) for data isolation.

## Architecture Pattern

**Multi-Tenant Architecture**: Each organization (client) has complete data isolation through the `client_id` foreign key in all tables. Row Level Security (RLS) policies ensure users can only access data belonging to their organization.

## Database Tables

### 1. Clients Table

**Purpose**: Root table for multi-tenant architecture, representing different organizations using the system.

**Table Name**: `clients`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Organization name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Organization email |
| phone | VARCHAR(50) | NULL | Contact phone number |
| address | TEXT | NULL | Physical address |
| city | VARCHAR(100) | NULL | City location |
| state | VARCHAR(100) | NULL | State/Province |
| country | VARCHAR(100) | NULL | Country |
| postal_code | VARCHAR(20) | NULL | Postal/ZIP code |
| logo_url | TEXT | NULL | URL to organization logo |
| status | VARCHAR(50) | CHECK (status IN ('active', 'inactive', 'suspended')), DEFAULT 'active' | Organization status |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_clients_email` on `email`
- `idx_clients_status` on `status`

---

### 2. Users Table

**Purpose**: Application users linked to Supabase authentication, representing staff members of organizations.

**Table Name**: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE | Unique identifier (from Supabase auth) |
| client_id | UUID | NOT NULL, REFERENCES clients(id) ON DELETE CASCADE | Organization the user belongs to |
| email | VARCHAR(255) | NOT NULL | User email address |
| full_name | VARCHAR(255) | NULL | User's full name |
| phone | VARCHAR(50) | NULL | Contact phone number |
| role | VARCHAR(50) | CHECK (role IN ('admin', 'manager', 'user')), DEFAULT 'user' | User role for permissions |
| avatar_url | TEXT | NULL | URL to user profile image |
| status | VARCHAR(50) | CHECK (status IN ('active', 'inactive')), DEFAULT 'active' | User account status |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Roles**:
- **admin**: Full system access, can delete records
- **manager**: Can manage properties, tenants, and leases
- **user**: Read-only access

**Indexes**:
- `idx_users_client_id` on `client_id`
- `idx_users_email` on `email`
- `idx_users_role` on `role`

---

### 3. Buildings Table

**Purpose**: Represents physical buildings/properties managed by organizations.

**Table Name**: `buildings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| client_id | UUID | NOT NULL, REFERENCES clients(id) ON DELETE CASCADE | Owning organization |
| name | VARCHAR(255) | NOT NULL | Building name |
| address | TEXT | NOT NULL | Street address |
| city | VARCHAR(100) | NOT NULL | City location |
| state | VARCHAR(100) | NULL | State/Province |
| country | VARCHAR(100) | NOT NULL | Country |
| postal_code | VARCHAR(20) | NULL | Postal/ZIP code |
| description | TEXT | NULL | Building description |
| total_floors | INTEGER | DEFAULT 1 | Number of floors |
| total_rooms | INTEGER | DEFAULT 0 | Total number of units |
| year_built | INTEGER | NULL | Construction year |
| building_type | VARCHAR(100) | CHECK (building_type IN ('residential', 'commercial', 'mixed')), DEFAULT 'residential' | Type of building |
| amenities | TEXT[] | NULL | Array of building amenities |
| image_url | TEXT | NULL | URL to building image |
| status | VARCHAR(50) | CHECK (status IN ('active', 'inactive', 'under_construction', 'maintenance')), DEFAULT 'active' | Building status |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_buildings_client_id` on `client_id`
- `idx_buildings_status` on `status`
- `idx_buildings_city` on `city`

---

### 4. Rooms Table

**Purpose**: Represents individual rental units/apartments within buildings.

**Table Name**: `rooms`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| client_id | UUID | NOT NULL, REFERENCES clients(id) ON DELETE CASCADE | Owning organization |
| building_id | UUID | NOT NULL, REFERENCES buildings(id) ON DELETE CASCADE | Parent building |
| room_number | VARCHAR(50) | NOT NULL, UNIQUE(building_id, room_number) | Unit/apartment number |
| floor_number | INTEGER | NULL | Floor location |
| room_type | VARCHAR(100) | CHECK (room_type IN ('studio', '1bedroom', '2bedroom', '3bedroom', 'penthouse', 'other')), DEFAULT 'studio' | Type of unit |
| area_sqft | DECIMAL(10, 2) | NULL | Area in square feet |
| bedrooms | INTEGER | DEFAULT 1 | Number of bedrooms |
| bathrooms | INTEGER | DEFAULT 1 | Number of bathrooms |
| description | TEXT | NULL | Room description |
| rent_amount | DECIMAL(10, 2) | NOT NULL | Monthly rent amount |
| deposit_amount | DECIMAL(10, 2) | NULL | Security deposit amount |
| currency | VARCHAR(10) | DEFAULT 'USD' | Currency code |
| amenities | TEXT[] | NULL | Array of room-specific amenities |
| image_urls | TEXT[] | NULL | Array of room image URLs |
| status | VARCHAR(50) | CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')), DEFAULT 'available' | Room availability status |
| available_from | DATE | NULL | Date when room becomes available |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Constraints**:
- Unique combination of `building_id` and `room_number`

**Indexes**:
- `idx_rooms_client_id` on `client_id`
- `idx_rooms_building_id` on `building_id`
- `idx_rooms_status` on `status`
- `idx_rooms_available_from` on `available_from`

---

### 5. Tenants Table

**Purpose**: Stores information about people who rent or have rented units.

**Table Name**: `tenants`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| client_id | UUID | NOT NULL, REFERENCES clients(id) ON DELETE CASCADE | Owning organization |
| first_name | VARCHAR(100) | NOT NULL | Tenant's first name |
| last_name | VARCHAR(100) | NOT NULL | Tenant's last name |
| email | VARCHAR(255) | NULL | Email address |
| phone | VARCHAR(50) | NOT NULL | Contact phone number |
| date_of_birth | DATE | NULL | Date of birth |
| national_id | VARCHAR(100) | NULL | National ID/SSN |
| emergency_contact_name | VARCHAR(255) | NULL | Emergency contact person |
| emergency_contact_phone | VARCHAR(50) | NULL | Emergency contact number |
| current_address | TEXT | NULL | Current residential address |
| occupation | VARCHAR(255) | NULL | Tenant's occupation |
| employer | VARCHAR(255) | NULL | Employer name |
| monthly_income | DECIMAL(10, 2) | NULL | Monthly income amount |
| profile_image_url | TEXT | NULL | URL to profile image |
| status | VARCHAR(50) | CHECK (status IN ('active', 'inactive', 'blacklisted')), DEFAULT 'active' | Tenant status |
| notes | TEXT | NULL | Additional notes |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_tenants_client_id` on `client_id`
- `idx_tenants_email` on `email`
- `idx_tenants_phone` on `phone`
- `idx_tenants_status` on `status`

---

### 6. Leases Table

**Purpose**: Represents rental agreements between tenants and rooms.

**Table Name**: `leases`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| client_id | UUID | NOT NULL, REFERENCES clients(id) ON DELETE CASCADE | Owning organization |
| room_id | UUID | NOT NULL, REFERENCES rooms(id) ON DELETE CASCADE | Rented room |
| tenant_id | UUID | NOT NULL, REFERENCES tenants(id) ON DELETE CASCADE | Tenant renting the room |
| lease_number | VARCHAR(100) | UNIQUE | Lease contract number |
| start_date | DATE | NOT NULL | Lease start date |
| end_date | DATE | NOT NULL, CHECK (end_date > start_date) | Lease end date |
| rent_amount | DECIMAL(10, 2) | NOT NULL | Monthly rent amount |
| deposit_amount | DECIMAL(10, 2) | NULL | Security deposit |
| payment_due_day | INTEGER | CHECK (payment_due_day BETWEEN 1 AND 31), DEFAULT 1 | Day of month payment is due |
| payment_frequency | VARCHAR(50) | CHECK (payment_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')), DEFAULT 'monthly' | Payment frequency |
| contract_url | TEXT | NULL | URL to signed lease document |
| status | VARCHAR(50) | CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'renewed')), DEFAULT 'active' | Lease status |
| notes | TEXT | NULL | Additional notes |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Business Rules**:
- Only one active or draft lease per room at a time (enforced by database constraint)
- End date must be after start date

**Indexes**:
- `idx_leases_client_id` on `client_id`
- `idx_leases_room_id` on `room_id`
- `idx_leases_tenant_id` on `tenant_id`
- `idx_leases_status` on `status`
- `idx_leases_dates` on `start_date, end_date`

---

### 7. Payments Table

**Purpose**: Tracks rent payments made by tenants.

**Table Name**: `payments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| client_id | UUID | NOT NULL, REFERENCES clients(id) ON DELETE CASCADE | Owning organization |
| lease_id | UUID | NOT NULL, REFERENCES leases(id) ON DELETE CASCADE | Associated lease |
| payment_date | DATE | NOT NULL | Date payment was made |
| due_date | DATE | NOT NULL | Date payment was due |
| amount | DECIMAL(10, 2) | NOT NULL | Payment amount |
| payment_method | VARCHAR(50) | CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'credit_card', 'debit_card', 'mobile_payment', 'other')) | Method of payment |
| transaction_reference | VARCHAR(255) | NULL | Transaction reference number |
| status | VARCHAR(50) | CHECK (status IN ('pending', 'paid', 'partial', 'late', 'failed', 'refunded')), DEFAULT 'pending' | Payment status |
| late_fee | DECIMAL(10, 2) | DEFAULT 0 | Late payment fee |
| notes | TEXT | NULL | Additional notes |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_payments_client_id` on `client_id`
- `idx_payments_lease_id` on `lease_id`
- `idx_payments_status` on `status`
- `idx_payments_dates` on `payment_date, due_date`

---

### 8. Maintenance Requests Table

**Purpose**: Tracks maintenance and repair requests for rooms.

**Table Name**: `maintenance_requests`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier |
| client_id | UUID | NOT NULL, REFERENCES clients(id) ON DELETE CASCADE | Owning organization |
| room_id | UUID | NOT NULL, REFERENCES rooms(id) ON DELETE CASCADE | Room requiring maintenance |
| tenant_id | UUID | REFERENCES tenants(id) ON DELETE SET NULL | Tenant who reported (if applicable) |
| title | VARCHAR(255) | NOT NULL | Request title |
| description | TEXT | NOT NULL | Detailed description |
| category | VARCHAR(100) | CHECK (category IN ('plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest_control', 'cleaning', 'other')) | Category of maintenance |
| priority | VARCHAR(50) | CHECK (priority IN ('low', 'medium', 'high', 'urgent')), DEFAULT 'medium' | Priority level |
| status | VARCHAR(50) | CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')), DEFAULT 'open' | Request status |
| assigned_to | UUID | REFERENCES users(id) ON DELETE SET NULL | User assigned to handle request |
| reported_date | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | When request was reported |
| scheduled_date | TIMESTAMP WITH TIME ZONE | NULL | Scheduled maintenance date |
| completed_date | TIMESTAMP WITH TIME ZONE | NULL | When maintenance was completed |
| estimated_cost | DECIMAL(10, 2) | NULL | Estimated repair cost |
| actual_cost | DECIMAL(10, 2) | NULL | Actual repair cost |
| image_urls | TEXT[] | NULL | Array of image URLs showing issue |
| notes | TEXT | NULL | Additional notes |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_maintenance_client_id` on `client_id`
- `idx_maintenance_room_id` on `room_id`
- `idx_maintenance_tenant_id` on `tenant_id`
- `idx_maintenance_status` on `status`
- `idx_maintenance_priority` on `priority`

---

## Database Views

### 1. Active Leases View

**View Name**: `active_leases_view`

**Purpose**: Provides a consolidated view of active leases with tenant and room details.

**Columns**:
- `id` - Lease ID
- `client_id` - Organization ID
- `lease_number` - Lease contract number
- `start_date` - Lease start date
- `end_date` - Lease end date
- `rent_amount` - Monthly rent
- `status` - Lease status
- `tenant_name` - Full name of tenant
- `tenant_phone` - Tenant phone number
- `tenant_email` - Tenant email
- `building_name` - Building name
- `room_number` - Room/unit number
- `floor_number` - Floor number

**Query**:
```sql
SELECT 
    l.id, l.client_id, l.lease_number,
    l.start_date, l.end_date, l.rent_amount, l.status,
    t.first_name || ' ' || t.last_name AS tenant_name,
    t.phone AS tenant_phone, t.email AS tenant_email,
    b.name AS building_name,
    r.room_number, r.floor_number
FROM leases l
JOIN tenants t ON l.tenant_id = t.id
JOIN rooms r ON l.room_id = r.id
JOIN buildings b ON r.building_id = b.id
WHERE l.status = 'active';
```

---

### 2. Available Rooms View

**View Name**: `available_rooms_view`

**Purpose**: Shows all rooms currently available for rent.

**Columns**:
- `id` - Room ID
- `client_id` - Organization ID
- `room_number` - Room/unit number
- `floor_number` - Floor number
- `room_type` - Type of unit
- `area_sqft` - Area in square feet
- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `rent_amount` - Monthly rent
- `available_from` - Available date
- `building_name` - Building name
- `building_address` - Building address
- `building_city` - Building city

**Query**:
```sql
SELECT 
    r.id, r.client_id, r.room_number, r.floor_number,
    r.room_type, r.area_sqft, r.bedrooms, r.bathrooms,
    r.rent_amount, r.available_from,
    b.name AS building_name,
    b.address AS building_address,
    b.city AS building_city
FROM rooms r
JOIN buildings b ON r.building_id = b.id
WHERE r.status = 'available';
```

---

### 3. Outstanding Payments View

**View Name**: `outstanding_payments_view`

**Purpose**: Shows payments that are pending, late, or partially paid.

**Columns**:
- `id` - Payment ID
- `client_id` - Organization ID
- `due_date` - Payment due date
- `amount` - Payment amount
- `late_fee` - Late fee amount
- `status` - Payment status
- `lease_number` - Lease contract number
- `tenant_name` - Tenant full name
- `tenant_phone` - Tenant phone
- `room_number` - Room/unit number
- `building_name` - Building name

**Query**:
```sql
SELECT 
    p.id, p.client_id, p.due_date, p.amount, p.late_fee, p.status,
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
```

---

## Entity Relationships

```
clients (1) ──┬──< buildings (*)
              ├──< rooms (*)
              ├──< tenants (*)
              ├──< leases (*)
              ├──< payments (*)
              ├──< maintenance_requests (*)
              └──< users (*)

buildings (1) ──< rooms (*)

rooms (1) ──┬──< leases (*)
            └──< maintenance_requests (*)

tenants (1) ──┬──< leases (*)
              └──< maintenance_requests (*)

leases (1) ──< payments (*)

users (1) ──< maintenance_requests (*) [assigned_to]

auth.users (1) ──< users (1) [id]
```

**Key**:
- `(1)` = One
- `(*)` = Many
- `──<` = One-to-Many relationship

---

## TypeScript Types

The application uses TypeScript types defined in `src/types/database.types.ts`:

```typescript
export interface Database {
  public: {
    Tables: {
      clients: { Row, Insert, Update };
      buildings: { Row, Insert, Update };
      rooms: { Row, Insert, Update };
      users: { Row, Insert, Update };
      leases: { Row, Insert, Update };
      tenants: { Row, Insert, Update };
      payments: { Row, Insert, Update };
      maintenance_requests: { Row, Insert, Update };
    };
    Views: {
      available_rooms_view: { Row };
      active_leases_view: { Row };
      outstanding_payments_view: { Row };
    };
  };
}
```

**Type Definitions**:
- **Row**: Complete record structure with all fields
- **Insert**: Record structure for insertion (omits auto-generated fields)
- **Update**: Partial record structure for updates

---

## Row Level Security (RLS) Policies

All tables have Row Level Security enabled to ensure multi-tenant data isolation.

### Users Table Policies

1. **View Policy**: Users can view users from their own organization
   ```sql
   client_id IN (SELECT client_id FROM users WHERE id = auth.uid())
   ```

2. **Update Policy**: Users can update their own profile
   ```sql
   id = auth.uid()
   ```

### Buildings Table Policies

1. **View Policy**: Users can view buildings from their organization
2. **Insert Policy**: Only admins and managers can create buildings
3. **Update Policy**: Only admins and managers can update buildings
4. **Delete Policy**: Only admins can delete buildings

### Rooms Table Policies

1. **View Policy**: Users can view rooms from their organization
2. **Insert Policy**: Only admins and managers can create rooms
3. **Update Policy**: Only admins and managers can update rooms
4. **Delete Policy**: Only admins can delete rooms

### Tenants Table Policies

1. **View Policy**: Users can view tenants from their organization
2. **All Operations**: Only admins and managers can manage tenants

### Leases Table Policies

1. **View Policy**: Users can view leases from their organization
2. **All Operations**: Only admins and managers can manage leases

### Payments Table Policies

1. **View Policy**: Users can view payments from their organization
2. **All Operations**: Only admins and managers can manage payments

### Maintenance Requests Table Policies

1. **View Policy**: Users can view maintenance requests from their organization
2. **Insert Policy**: All authenticated users can create maintenance requests
3. **Update Policy**: Only admins and managers can update maintenance requests

---

## Database Triggers

### Update Timestamp Trigger

**Function**: `update_updated_at_column()`

**Purpose**: Automatically updates the `updated_at` column when a record is modified.

**Applied To**:
- clients
- users
- buildings
- rooms
- tenants
- leases
- payments
- maintenance_requests

---

## Data Constraints and Business Rules

### Multi-Tenancy
- All data is scoped by `client_id`
- Users cannot access data from other organizations
- RLS policies automatically filter queries by organization

### Buildings
- Must belong to a client organization
- Cascade delete: Deleting a building deletes all its rooms

### Rooms
- Must belong to both a client and a building
- Room numbers must be unique within a building
- Status must be one of: available, occupied, maintenance, reserved

### Tenants
- Must belong to a client organization
- Phone number is required
- Can have multiple leases over time

### Leases
- Must link a tenant to a specific room
- End date must be after start date
- Only one active or draft lease per room (enforced by unique constraint)
- Status workflow: draft → active → expired/terminated/renewed

### Payments
- Must be linked to a lease
- Tracks both due date and payment date
- Can have late fees
- Status tracks payment state: pending → paid/late/failed

### Maintenance Requests
- Must be linked to a room
- Can optionally link to a tenant and assigned user
- Status workflow: open → in_progress → completed/cancelled

---

## Data Model Summary

**Total Tables**: 8 main tables
**Total Views**: 3 database views
**Total Indexes**: 26 performance indexes
**Total Constraints**: 29 check constraints, 8 foreign keys per multi-tenant table

**Key Features**:
- ✅ Multi-tenant architecture with complete data isolation
- ✅ Row Level Security for all tables
- ✅ Automatic timestamp management
- ✅ Comprehensive indexing for performance
- ✅ Referential integrity with foreign keys
- ✅ Business rule enforcement via constraints
- ✅ Optimized views for common queries
- ✅ Role-based access control (Admin, Manager, User)

---

## Future Enhancements

Potential additions to the data model:
1. **Notifications table** for tracking system notifications
2. **Documents table** for storing lease documents and attachments
3. **Audit log table** for tracking data changes
4. **Amenity master table** for standardized amenity lists
5. **Payment schedules table** for automatic payment generation
6. **Invoice table** for formal billing records
7. **Expense tracking table** for property expenses
8. **Contract templates table** for lease template management
