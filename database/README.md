# Database Documentation

## Overview
The Apartment Rental Management database is designed with a **multi-tenant architecture** using PostgreSQL (Supabase). Each client (organization) has isolated data access through Row Level Security (RLS) policies.

## Schema Diagram

```
┌─────────────┐
│   Clients   │ (Root tenant table)
└──────┬──────┘
       │
       ├──────────┬──────────────┬──────────────┬──────────────┐
       │          │              │              │              │
┌──────▼──────┐ ┌─▼─────────┐ ┌─▼──────────┐ ┌─▼──────────┐ ┌─▼──────────┐
│    Users    │ │ Buildings │ │  Tenants   │ │  Payments  │ │ Maintenance│
└─────────────┘ └─────┬─────┘ └─────┬──────┘ └──────┬─────┘ └──────┬─────┘
                      │             │               │              │
                ┌─────▼─────┐       │               │              │
                │   Rooms   │◄──────┤               │              │
                └─────┬─────┘       │               │              │
                      │             │               │              │
                ┌─────▼─────────────▼───────────────┘              │
                │        Leases                                    │
                └──────────────────────────────────────────────────┘
```

## Tables

### Core Tables

#### 1. **clients**
Root table for multi-tenancy. Each row represents an organization/company.

**Key Fields:**
- `id` (UUID, PK)
- `name` - Organization name
- `email` - Contact email
- `status` - active, inactive, suspended

**Purpose:** Tenant isolation root

---

#### 2. **users**
Application users linked to Supabase authentication.

**Key Fields:**
- `id` (UUID, PK, FK to auth.users)
- `client_id` (UUID, FK to clients)
- `role` - admin, manager, user
- `status` - active, inactive

**Purpose:** User management with role-based access

---

#### 3. **buildings**
Properties owned by clients.

**Key Fields:**
- `id` (UUID, PK)
- `client_id` (UUID, FK to clients)
- `name` - Building name
- `address`, `city`, `country` - Location
- `total_floors`, `total_rooms` - Building stats
- `building_type` - residential, commercial, mixed
- `amenities` - Array of features
- `status` - active, inactive, under_construction, maintenance

**Purpose:** Property portfolio management

---

#### 4. **rooms**
Rental units within buildings.

**Key Fields:**
- `id` (UUID, PK)
- `client_id` (UUID, FK to clients)
- `building_id` (UUID, FK to buildings)
- `room_number` - Unit identifier
- `room_type` - studio, 1bedroom, 2bedroom, etc.
- `rent_amount` - Monthly rent
- `status` - available, occupied, maintenance, reserved

**Constraints:**
- UNIQUE(building_id, room_number)

**Purpose:** Rental inventory management

---

#### 5. **tenants**
Individuals renting properties.

**Key Fields:**
- `id` (UUID, PK)
- `client_id` (UUID, FK to clients)
- `first_name`, `last_name`
- `email`, `phone`
- `occupation`, `monthly_income`
- `status` - active, inactive, blacklisted

**Purpose:** Renter information management

---

#### 6. **leases**
Rental agreements between tenants and rooms.

**Key Fields:**
- `id` (UUID, PK)
- `client_id` (UUID, FK to clients)
- `room_id` (UUID, FK to rooms)
- `tenant_id` (UUID, FK to tenants)
- `lease_number` - Unique identifier
- `start_date`, `end_date`
- `rent_amount`, `deposit_amount`
- `payment_due_day` - Day of month (1-31)
- `status` - draft, active, expired, terminated, renewed

**Constraints:**
- CHECK(end_date > start_date)

**Purpose:** Lease lifecycle management

---

#### 7. **payments**
Rent payment records.

**Key Fields:**
- `id` (UUID, PK)
- `client_id` (UUID, FK to clients)
- `lease_id` (UUID, FK to leases)
- `payment_date`, `due_date`
- `amount`, `late_fee`
- `payment_method` - cash, check, bank_transfer, etc.
- `status` - pending, paid, partial, late, failed, refunded

**Purpose:** Payment tracking and history

---

#### 8. **maintenance_requests**
Service and repair requests.

**Key Fields:**
- `id` (UUID, PK)
- `client_id` (UUID, FK to clients)
- `room_id` (UUID, FK to rooms)
- `tenant_id` (UUID, FK to tenants, nullable)
- `category` - plumbing, electrical, hvac, etc.
- `priority` - low, medium, high, urgent
- `status` - open, in_progress, completed, cancelled

**Purpose:** Maintenance workflow management

---

## Views

### 1. **active_leases_view**
Combines lease, tenant, room, and building information for active leases.

**Use Case:** Quick dashboard overview of current rentals

---

### 2. **available_rooms_view**
Lists all available rooms with building details.

**Use Case:** Room availability search

---

### 3. **outstanding_payments_view**
Shows pending, late, or partial payments with tenant and room details.

**Use Case:** Payment collection tracking

---

## Row Level Security (RLS)

### Security Model
All tables have RLS enabled to enforce multi-tenant data isolation.

### Policy Summary

**General Pattern:**
- Users can only access data belonging to their `client_id`
- Role-based permissions for INSERT/UPDATE/DELETE operations

**Specific Policies:**

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| users | Own client | - | Own profile | - |
| buildings | Own client | Admin/Manager | Admin/Manager | Admin |
| rooms | Own client | Admin/Manager | Admin/Manager | Admin |
| tenants | Own client | Admin/Manager | Admin/Manager | Admin/Manager |
| leases | Own client | Admin/Manager | Admin/Manager | Admin/Manager |
| payments | Own client | Admin/Manager | Admin/Manager | Admin/Manager |
| maintenance_requests | Own client | All users | Admin/Manager | - |

### User Roles
- **admin**: Full access to all client data
- **manager**: Can manage buildings, rooms, tenants, leases
- **user**: Read-only access, can create maintenance requests

---

## Indexes

Performance indexes are created on:
- Foreign keys (`client_id`, `building_id`, etc.)
- Commonly queried fields (`status`, `email`, `phone`)
- Date ranges (`start_date`, `end_date`, `due_date`)

---

## Triggers

### update_updated_at_column()
Automatically updates the `updated_at` timestamp on all tables when records are modified.

**Applied to:**
- clients
- users
- buildings
- rooms
- tenants
- leases
- payments
- maintenance_requests

---

## Setup Instructions

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign up or log in
3. Create a new project
4. Note your project URL and API keys

### 2. Run Schema Migration
1. Open the SQL Editor in Supabase Dashboard
2. Copy and paste the contents of `schema.sql`
3. Execute the script
4. Verify all tables are created

### 3. Seed Development Data (Optional)
1. Open the SQL Editor
2. Copy and paste the contents of `seed.sql`
3. Execute the script
4. Verify data is inserted

### 4. Configure Authentication
1. Enable Email authentication in Supabase Dashboard
2. Configure email templates (optional)
3. Set up redirect URLs for your app

---

## Data Types Reference

### Common Fields
- **UUID**: Universally unique identifier (128-bit)
- **VARCHAR(n)**: Variable-length string with max length n
- **TEXT**: Unlimited length text
- **INTEGER**: Whole numbers
- **DECIMAL(p,s)**: Decimal numbers (p=precision, s=scale)
- **DATE**: Date without time
- **TIMESTAMP WITH TIME ZONE**: Date and time with timezone
- **ARRAY**: PostgreSQL array type

### Custom Types (Enums)
Implemented as CHECK constraints:
- status values (varies by table)
- room_type, building_type
- payment_method
- priority, category (maintenance)
- role (users)

---

## Best Practices

### 1. Always Include client_id
Every query should filter by `client_id` to ensure tenant isolation.

### 2. Use Transactions
For operations that affect multiple tables (e.g., creating a lease and updating room status).

### 3. Validate Dates
Ensure lease dates don't overlap for the same room.

### 4. Handle Cascading Deletes
Be aware of ON DELETE CASCADE relationships:
- Deleting a client removes all related data
- Deleting a building removes all rooms and related records

### 5. Use Views for Complex Queries
Leverage the provided views for common data needs.

---

## Maintenance

### Regular Tasks
1. **Backup**: Supabase provides automatic backups (Pro plan)
2. **Monitoring**: Check slow queries in Supabase Dashboard
3. **Data Cleanup**: Archive old leases and payments periodically
4. **Index Optimization**: Review and add indexes based on query patterns

### Schema Updates
When modifying the schema:
1. Test changes in development first
2. Create migration scripts
3. Consider backward compatibility
4. Update RLS policies if needed

---

## Security Considerations

### 1. Row Level Security
Never disable RLS on production tables.

### 2. API Keys
- Use anon key for client applications
- Never expose service_role key
- Store keys securely (environment variables)

### 3. User Authentication
- Enforce strong password policies
- Enable MFA (Multi-Factor Authentication)
- Implement session timeout

### 4. Data Validation
- Validate all inputs before insertion
- Use CHECK constraints for data integrity
- Sanitize user-provided data

### 5. Audit Trail
Consider adding audit tables for sensitive operations (deletions, status changes).

---

## Troubleshooting

### Issue: RLS Policies Not Working
**Solution:** Ensure user is authenticated and has correct `client_id` in the users table.

### Issue: Slow Queries
**Solution:** Check missing indexes, use EXPLAIN ANALYZE to identify bottlenecks.

### Issue: Foreign Key Violations
**Solution:** Ensure referenced records exist before insertion.

### Issue: Can't Delete Records
**Solution:** Check RLS policies and user role permissions.

---

## Future Enhancements

Potential schema additions:
- **documents** table for lease attachments
- **notifications** table for push notifications
- **audit_logs** table for compliance
- **reports** table for saved reports
- **property_images** table for multiple photos
- **amenity_bookings** table for shared facilities
- **utility_bills** table for utility tracking

---

## Contact & Support

For questions or issues:
1. Check Supabase documentation: https://supabase.com/docs
2. Review this documentation
3. Contact project maintainer

---

**Last Updated:** February 2024
**Database Version:** 1.0
**PostgreSQL Version:** 14+ (via Supabase)
