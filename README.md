# 🏢 Apartment Rental Management Mobile App

A comprehensive multi-tenant apartment and property management mobile application built with React Native, TypeScript, and Supabase.

![React Native](https://img.shields.io/badge/React%20Native-0.84-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Gluestack UI](https://img.shields.io/badge/Gluestack-UI-purple)

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This mobile application provides a complete solution for managing apartment rentals across multiple properties. It supports multi-tenant architecture, allowing multiple organizations to manage their property portfolios independently within a single application.

### Key Capabilities
- 🏗️ Manage multiple buildings and properties
- 🏠 Track rooms/units and their availability
- 👥 Tenant management with lease tracking
- 💰 Payment tracking and history
- 🔧 Maintenance request management
- 🔐 Secure authentication with role-based access
- 📊 Real-time data synchronization
- 🌐 Multi-tenant with complete data isolation

## ✨ Features

### For Property Managers
- **Building Management**: Add, edit, and organize multiple properties
- **Unit Management**: Track availability, pricing, and amenities for each unit
- **Tenant Portal**: Manage tenant information and communication
- **Lease Tracking**: Monitor active leases and expiration dates
- **Payment Tracking**: Record and track rent payments
- **Maintenance Requests**: Handle repair and maintenance workflows

### For System Admins
- **Multi-Tenant Support**: Manage multiple organizations in one system
- **Role-Based Access**: Control permissions (Admin, Manager, User)
- **Data Security**: Row Level Security (RLS) ensures data isolation
- **Audit Trails**: Track changes and user actions

### Technical Features
- **Offline Support**: AsyncStorage for local data persistence
- **Real-time Updates**: Supabase real-time subscriptions
- **Type Safety**: Full TypeScript support
- **Modern UI**: Gluestack UI component library
- **Cross-Platform**: Single codebase for iOS and Android

## 🛠 Tech Stack

### Frontend
- **Framework**: React Native 0.84.0
- **Language**: TypeScript 5.8
- **UI Library**: Gluestack UI 1.1
- **Navigation**: React Navigation 7.0
- **State Management**: React Hooks + Context API

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **API**: Supabase Client
- **Storage**: AsyncStorage for local data

### Development Tools
- **Build System**: Metro Bundler
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Testing**: Jest
- **Version Control**: Git

## 📸 Screenshots

*Coming soon - Screenshots will be added after initial deployment*

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- React Native development environment
- iOS: Xcode (macOS only)
- Android: Android Studio
- Supabase account

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/phuongtvn/ApartmentRentalMobile.git
   cd ApartmentRentalMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the database migration: `database/schema.sql`
   - Optionally load seed data: `database/seed.sql`

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. **Run the app**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

For detailed setup instructions, see [instruction.md](./instruction.md)

## 📚 Documentation

- **[Setup Instructions](./instruction.md)** - Complete setup and configuration guide
- **[Project Planning](./planning.md)** - Development roadmap and task breakdown
- **[Database Documentation](./database/README.md)** - Database schema and architecture
- **[Database Schema](./database/schema.sql)** - SQL migration script
- **[Seed Data](./database/seed.sql)** - Sample data for testing

## 📁 Project Structure

```
ApartmentRentalMobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation setup
│   ├── services/        # Business logic & API
│   ├── types/           # TypeScript definitions
│   ├── config/          # App configuration
│   └── assets/          # Images, fonts, etc.
├── database/            # Database scripts
├── android/             # Android native code
├── ios/                 # iOS native code
├── App.tsx              # Root component
└── package.json         # Dependencies
```

## 🎨 Architecture

### Multi-Tenant Architecture
The application uses a multi-tenant architecture where:
- Each organization (client) has isolated data
- Row Level Security (RLS) enforces data access
- Users belong to one client organization
- All queries are automatically scoped by client_id

### Data Flow
```
User → React Native App → Supabase Client → PostgreSQL
                                           ↓
                                    RLS Policies
                                           ↓
                                    Filtered Data
```

### Security Model
- **Authentication**: Supabase Auth (JWT tokens)
- **Authorization**: Row Level Security policies
- **Data Isolation**: Client-scoped queries
- **Role-Based Access**: Admin, Manager, User roles

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run linter
npm run lint
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure:
- Code follows the existing style
- All tests pass
- Documentation is updated
- Commits are meaningful

## 📝 Development Guidelines

- Write clean, maintainable code
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add comments for complex logic
- Keep components small and focused

## 🐛 Known Issues

- None currently reported

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Database schema design
- [x] Project initialization
- [x] Supabase integration
- [x] Basic UI setup
- [ ] Authentication screens
- [ ] Building management UI
- [ ] Room management UI

### Phase 2 (Planned)
- [ ] Tenant management
- [ ] Lease management
- [ ] Payment tracking
- [ ] Maintenance requests
- [ ] Push notifications
- [ ] Report generation

### Phase 3 (Future)
- [ ] Document management
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline mode
- [ ] Payment gateway integration

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## 👥 Authors

- **Phuong Nguyen** - Initial work - [phuongtvn](https://github.com/phuongtvn)

## 🙏 Acknowledgments

- React Native community for excellent documentation
- Supabase for powerful backend infrastructure
- Gluestack for beautiful UI components
- All contributors and supporters

## 📞 Support

For support and questions:
- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/phuongtvn/ApartmentRentalMobile/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/phuongtvn/ApartmentRentalMobile/discussions)

## 📊 Project Status

**Status**: �� Active Development  
**Version**: 1.0.0  
**Last Updated**: February 2024

---

Made with ❤️ using React Native and Supabase
