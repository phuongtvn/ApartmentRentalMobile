# Business Requirements - Apartment Rental Management Mobile App

## Project Purpose
A comprehensive multi-tenant apartment and property management mobile application that allows multiple organizations to manage their property portfolios independently within a single application.

## Business Objectives
- Enable property managers to efficiently manage multiple buildings and properties
- Track rooms/units and their availability status
- Manage tenant information and lease agreements
- Track payment history and records
- Handle maintenance request workflows
- Provide secure access with role-based permissions
- Ensure complete data isolation between different organizations

## Target Users

### Property Managers
- Manage building portfolios
- Track unit availability and pricing
- Handle tenant relationships
- Monitor lease agreements and expiration dates
- Record and track rent payments
- Manage maintenance requests

### System Administrators
- Oversee multiple organizations within one system
- Control user permissions and roles (Admin, Manager, User)
- Ensure data security and isolation between tenants
- Monitor system usage and audit trails

## Core Business Features

### 1. Multi-Tenant Support
- Support multiple organizations (clients) managing their properties independently
- Complete data isolation between different organizations
- Each user belongs to one client organization
- All data automatically scoped by organization

### 2. Property Management
- Add, edit, and organize multiple buildings/properties
- Track building details (name, address, number of floors, total units)
- View all properties in a portfolio
- Delete properties when no longer managed

### 3. Unit/Room Management
- Track individual units within buildings
- Manage unit details (number, floor, size, amenities)
- Set and update pricing for each unit
- Monitor unit availability status:
  - Available (ready for rent)
  - Occupied (currently rented)
  - Under Maintenance
  - Reserved (pending move-in)

### 4. Tenant Management
- Maintain tenant information database
- Track tenant contact details
- Link tenants to their rental units
- Manage tenant communication

### 5. Lease Management
- Create and track rental agreements
- Monitor active leases
- Track lease start and end dates
- Alert on upcoming lease expirations
- Record lease terms and conditions
- **Only one active contract per room at any time**
- Access contract directly from room details screen
- Contract includes tenant, rent amount, deposit, payment schedule, and notes

### 6. Payment Tracking
- Record rent payments
- Track payment history
- Monitor outstanding payments
- Generate payment receipts
- View payment status by tenant or property

### 7. Maintenance Requests
- Submit maintenance/repair requests
- Track request status (pending, in progress, completed)
- Assign maintenance tasks
- Maintain history of maintenance activities
- Monitor maintenance costs

### 8. User Authentication & Security
- Secure user login and registration
- Password reset functionality
- Role-based access control:
  - **Admin**: Full system access
  - **Manager**: Property and tenant management
  - **User**: Limited read access
- Session management
- Data encryption and secure storage

### 9. Real-Time Data Synchronization
- Instant updates across all devices
- Automatic data refresh
- Offline data persistence
- Sync when connection restored

## Business Rules

### Multi-Tenancy Rules
- Each organization's data must be completely isolated
- Users cannot access data from other organizations
- All database queries must be automatically filtered by organization ID
- User authentication tied to specific organization

### Property Rules
- Buildings must belong to an organization
- Buildings must have unique identifiers within an organization
- Buildings can contain multiple units/rooms
- Building information must include address and basic details

### Unit/Room Rules
- Rooms must belong to a building
- Room numbers must be unique within a building
- Room status must be one of: Available, Occupied, Maintenance, Reserved
- Pricing information is required for available units
- Occupied rooms must have associated tenant and lease

### Tenant Rules
- Tenants must have valid contact information
- One tenant can have multiple leases (over time)
- Active tenants must be linked to current lease agreements

### Lease Rules
- Leases must link tenant to specific unit
- Lease must have start and end dates
- End date must be after start date
- Only one active lease per unit at a time
- Lease terms must include rent amount
- **Only one active or draft contract per room is enforced at the database level**
- **Contract can be created directly from the room details screen**
- **Room can only have a new contract when no active/draft contract exists**

### Payment Rules
- Payments must be linked to a lease
- Payment amount and date must be recorded
- Payment history must be maintained
- Overdue payments should be trackable

### Maintenance Rules
- Maintenance requests must be linked to a property or unit
- Requests must have status tracking
- Request history must be maintained
- Resolution notes should be recorded

## Reporting Requirements

### Property Reports
- List of all properties managed
- Occupancy rates by property
- Available units across portfolio
- Revenue by property

### Financial Reports
- Payment collection summary
- Outstanding payments report
- Revenue by time period
- Payment history by tenant

### Maintenance Reports
- Open maintenance requests
- Maintenance history by property
- Maintenance costs summary
- Average resolution time

## User Experience Requirements

### Mobile-First Design
- Optimized for mobile devices (iOS and Android)
- Touch-friendly interface
- Responsive layout
- Easy navigation between screens

### Ease of Use
- Intuitive user interface
- Clear visual hierarchy
- Quick access to common actions
- Simple form inputs with validation
- Helpful error messages

### Performance
- Fast loading times
- Smooth navigation transitions
- Efficient data loading
- Minimal battery consumption

## Future Business Enhancements (Planned)

### Phase 2
- Push notifications for important events (lease expiry, payment due)
- Report generation and export (PDF/Excel)
- Document management (upload/store lease documents)
- Advanced search and filtering

### Phase 3
- Analytics dashboard with insights
- Multi-language support
- Payment gateway integration for online payments
- Tenant portal for self-service
- Dark mode support
- Automated payment reminders
- Integration with accounting software

## Success Metrics
- Number of properties managed per organization
- User adoption rate
- Time saved in property management tasks
- Reduction in missed payments
- Faster maintenance request resolution
- User satisfaction scores
- System uptime and reliability

## Constraints and Assumptions

### Business Constraints
- Must support multiple organizations on single database
- Must work on both iOS and Android platforms
- Must comply with data privacy regulations
- Must maintain audit trails for compliance

### Assumptions
- Users have smartphones with iOS 15+ or Android 11+
- Internet connectivity available for real-time sync
- Organizations willing to migrate from existing systems
- Property managers have basic mobile app proficiency
