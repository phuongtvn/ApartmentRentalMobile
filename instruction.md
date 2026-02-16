# Apartment Rental Management - Setup Instructions

This guide will walk you through setting up and running the Apartment Rental Management mobile application.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Overview](#project-overview)
- [Database Setup (Supabase)](#database-setup-supabase)
- [Local Development Setup](#local-development-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js**: Version 18.x or higher
  - Check: `node --version`
  - Download: https://nodejs.org/

- **npm** or **yarn**: Package manager
  - npm comes with Node.js
  - Check: `npm --version`

- **Git**: Version control
  - Check: `git --version`
  - Download: https://git-scm.com/

### For iOS Development (macOS only)
- **Xcode**: Latest version from Mac App Store
- **CocoaPods**: `sudo gem install cocoapods`
- **iOS Simulator**: Comes with Xcode

### For Android Development
- **Android Studio**: Latest version
  - Download: https://developer.android.com/studio
- **Java Development Kit (JDK)**: Version 11 or higher
- **Android SDK**: Install via Android Studio
- **Android Emulator** or physical device

### Recommended Tools
- **VS Code**: Code editor with React Native extensions
- **React Native Debugger**: For debugging
- **Supabase CLI**: For database management (optional)
  ```bash
  npm install -g supabase
  ```

---

## Project Overview

### Tech Stack
- **Frontend**: React Native 0.84.0
- **Language**: TypeScript
- **UI Framework**: Gluestack UI
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Navigation**: React Navigation
- **State Management**: React Hooks + Context API

### Key Features
- Multi-tenant architecture (multiple clients/organizations)
- Building management
- Room/unit management
- User authentication
- Real-time database updates
- Role-based access control

---

## Database Setup (Supabase)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Verify your email address

### Step 2: Create a New Project
1. Click "New Project"
2. Fill in project details:
   - **Name**: ApartmentRentalManagement (or your preferred name)
   - **Database Password**: Create a strong password (save it securely!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Start with Free tier
3. Click "Create new project"
4. Wait 1-2 minutes for project initialization

### Step 3: Note Your Project Credentials
1. Go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy and save these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: (keep this secret, don't use in mobile app)

### Step 4: Run Database Migration
1. In Supabase Dashboard, click **SQL Editor** in sidebar
2. Click "New query"
3. Open the file `database/schema.sql` from this repository
4. Copy and paste the entire contents into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Wait for completion (should show "Success" message)
7. Verify tables are created:
   - Click **Table Editor** in sidebar
   - You should see tables: clients, users, buildings, rooms, etc.

### Step 5: Load Sample Data (Optional)
1. Still in **SQL Editor**, create a new query
2. Open the file `database/seed.sql`
3. Copy and paste the entire contents
4. Click **Run**
5. This creates sample data for testing:
   - 3 sample clients/organizations
   - 5 buildings
   - 12 rooms
   - 6 tenants with active leases

### Step 6: Configure Authentication
1. Go to **Authentication** > **Providers** in Supabase Dashboard
2. Enable **Email** provider (should be enabled by default)
3. Optionally configure:
   - Email templates (Invite, Reset Password, etc.)
   - Redirect URLs for your app
   - Session timeout settings

### Step 7: Row Level Security (RLS)
The schema already includes RLS policies for multi-tenant security.
To verify:
1. Go to **Table Editor**
2. Click on any table (e.g., "buildings")
3. Click **RLS** tab
4. You should see policies listed
5. Ensure RLS is **Enabled** (green toggle)

---

## Local Development Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/phuongtvn/ApartmentRentalMobile.git
cd ApartmentRentalMobile
```

### Step 2: Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

This will install all required packages including:
- React Native
- Supabase client
- Gluestack UI
- React Navigation
- AsyncStorage

### Step 3: iOS Setup (macOS only)
```bash
cd ios
pod install
cd ..
```

If you encounter issues:
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Step 4: Android Setup
No additional setup required if Android Studio is properly configured.

Verify Android SDK location:
```bash
# Check ANDROID_HOME environment variable
echo $ANDROID_HOME  # macOS/Linux
echo %ANDROID_HOME%  # Windows
```

If not set, add to your shell profile (~/.bash_profile, ~/.zshrc, etc.):
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

## Configuration

### Environment Variables

#### Step 1: Create .env File
```bash
cp .env.example .env
```

#### Step 2: Edit .env File
Open `.env` in your editor and fill in your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace:
- `xxxxx` with your project reference ID
- The anon key with your actual anon/public key from Supabase

#### Step 3: Verify Configuration
The app will read these values from `process.env`. If you need more robust environment variable management, consider installing:
```bash
npm install react-native-config
# or
yarn add react-native-config
```

### Update App Configuration (Optional)
Edit `app.json` to customize:
```json
{
  "name": "ApartmentRentalApp",
  "displayName": "Apartment Rental"
}
```

---

## Running the Application

### Start Metro Bundler
In one terminal window:
```bash
npm start
# or
yarn start
```

Keep this running. It's the JavaScript bundler.

### Run on iOS (macOS only)

#### Using Command Line:
```bash
npm run ios
# or
yarn ios
```

#### Using Xcode:
1. Open `ios/ApartmentRentalApp.xcworkspace` in Xcode
2. Select a simulator or connected device
3. Click the "Play" button or press Cmd + R

#### Troubleshooting iOS:
If build fails:
```bash
cd ios
pod install
cd ..
npm run ios
```

### Run on Android

#### Start Emulator First:
1. Open Android Studio
2. Click **AVD Manager** (phone icon)
3. Click **Play** button on an emulator
4. Wait for emulator to fully boot

#### Using Command Line:
```bash
npm run android
# or
yarn android
```

#### Using Android Studio:
1. Open the `android` folder in Android Studio
2. Wait for Gradle sync to complete
3. Click "Run" button or press Shift + F10

#### Troubleshooting Android:
If build fails:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Run on Physical Device

#### iOS Device:
1. Connect device via USB
2. Open Xcode
3. Select your device from target dropdown
4. Enable **Developer Mode** on your iPhone (Settings > Privacy & Security)
5. Trust your Mac when prompted
6. Run: `npm run ios`

#### Android Device:
1. Enable **Developer Options** on your Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
2. Enable **USB Debugging**:
   - Settings > Developer Options > USB Debugging
3. Connect device via USB
4. Verify connection: `adb devices`
5. Run: `npm run android`

---

## Project Structure

```
ApartmentRentalMobile/
├── android/                  # Android native code
├── ios/                      # iOS native code
├── src/                      # Source code
│   ├── components/           # Reusable UI components
│   │   └── ui/              # Gluestack UI custom components
│   ├── screens/              # Screen components
│   │   ├── auth/            # Authentication screens
│   │   ├── buildings/       # Building management screens
│   │   └── rooms/           # Room management screens
│   ├── navigation/           # Navigation configuration
│   ├── services/             # Business logic & API
│   │   ├── auth.service.ts  # Authentication service
│   │   └── database.service.ts # Database operations
│   ├── types/                # TypeScript types
│   │   └── database.types.ts # Database type definitions
│   ├── utils/                # Utility functions
│   ├── config/               # App configuration
│   │   ├── supabase.ts      # Supabase client setup
│   │   └── gluestack-ui.config.ts # UI theme config
│   └── assets/               # Images, fonts, etc.
├── database/                 # Database scripts
│   ├── schema.sql           # Database schema
│   ├── seed.sql             # Sample data
│   └── README.md            # Database documentation
├── App.tsx                   # Root component
├── index.js                  # App entry point
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── .env.example              # Environment template
├── instruction.md            # This file
└── planning.md               # Project planning doc
```

---

## Development Workflow

### 1. Check Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint -- --fix
```

### 2. Run Tests
```bash
npm test
```

### 3. Type Checking
TypeScript will check types during development. To manually check:
```bash
npx tsc --noEmit
```

### 4. Generate Database Types (Optional)
After making database schema changes:
```bash
# Login to Supabase
npx supabase login

# Generate types
npx supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts
```

### 5. Hot Reload
The app supports hot reloading. When you save a file:
- Metro bundler automatically reloads
- Changes appear in simulator/emulator

Enable Fast Refresh (should be default):
- Shake device/simulator
- Enable "Fast Refresh" in dev menu

---

## Troubleshooting

### Metro Bundler Issues

**Problem**: Metro won't start or shows port in use
```bash
# Kill existing Metro processes
npx react-native start --reset-cache

# Or manually kill process on port 8081
lsof -ti:8081 | xargs kill  # macOS/Linux
```

### Build Failures

**iOS Build Fails**:
```bash
# Clean build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

**Android Build Fails**:
```bash
# Clean Gradle cache
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..
npm run android
```

### Dependency Issues

**Problem**: Module not found or version conflicts
```bash
# Clear all caches
rm -rf node_modules
rm package-lock.json  # or yarn.lock
npm install
```

### Supabase Connection Issues

**Problem**: Can't connect to Supabase
1. Check `.env` file has correct values
2. Verify Supabase URL and key are correct
3. Check internet connection
4. Verify Supabase project is active (not paused)
5. Check console logs for error messages

**Problem**: RLS (Row Level Security) blocking queries
1. Verify user is authenticated
2. Check user has correct `client_id` in users table
3. Review RLS policies in Supabase Dashboard
4. Temporarily disable RLS for testing (not recommended for production)

### Device/Simulator Issues

**iOS Simulator**:
```bash
# Reset simulator
xcrun simctl erase all

# Or in Xcode: Device > Erase All Content and Settings
```

**Android Emulator**:
```bash
# Restart ADB
adb kill-server
adb start-server

# Cold boot emulator
# In Android Studio: AVD Manager > Cold Boot Now
```

### Common Errors

**Error**: "Unable to resolve module..."
```bash
npm start -- --reset-cache
```

**Error**: "Task :app:installDebug FAILED"
```bash
cd android
./gradlew clean
cd ..
```

**Error**: "CocoaPods related issue"
```bash
sudo gem install cocoapods
cd ios
pod install
cd ..
```

---

## Next Steps

After successful setup:

1. **Create a Test User**:
   - Run the app
   - Use signup screen (when implemented)
   - Or manually create user in Supabase Dashboard

2. **Link User to Client**:
   - In Supabase Dashboard, go to Table Editor
   - Open `users` table
   - Add row with your user's ID and a client_id

3. **Test CRUD Operations**:
   - Try creating a building
   - Add rooms to the building
   - Test filtering and search

4. **Explore Features**:
   - Review authentication flow
   - Test navigation
   - Experiment with Gluestack UI components

---

## Additional Resources

### Documentation
- **React Native**: https://reactnative.dev/docs/getting-started
- **Supabase**: https://supabase.com/docs
- **Gluestack UI**: https://gluestack.io/ui/docs
- **React Navigation**: https://reactnavigation.org/docs/getting-started
- **TypeScript**: https://www.typescriptlang.org/docs/

### Community
- **React Native Community**: https://reactnative.dev/community/overview
- **Supabase Discord**: https://discord.supabase.com
- **Stack Overflow**: Tag questions with `react-native`, `supabase`

### Tools
- **React Native Debugger**: https://github.com/jhen0409/react-native-debugger
- **Flipper**: https://fbflipper.com (debugging tool by Meta)
- **Reactotron**: https://github.com/infinitered/reactotron (debugging)

---

## Getting Help

If you encounter issues:

1. **Check this documentation** first
2. **Review error messages** carefully
3. **Check the logs**:
   - Metro bundler output
   - Xcode console (iOS)
   - Android Logcat (Android)
4. **Search existing issues** on GitHub
5. **Ask for help**:
   - Create a GitHub issue
   - Include error messages and logs
   - Describe steps to reproduce

---

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit `.env` file** with real credentials
2. **Never expose `service_role` key** in mobile app
3. **Always use `anon` key** for client applications
4. **Keep RLS enabled** on all production tables
5. **Validate all user inputs** before database operations
6. **Use HTTPS only** for API calls
7. **Implement proper error handling** (don't expose sensitive info)

---

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Write/update tests
5. Run linter and tests
6. Commit with clear messages
7. Push and create a Pull Request

---

## License

[Specify your license here]

---

## Support

For questions or support:
- **Email**: [your-email]
- **GitHub Issues**: https://github.com/phuongtvn/ApartmentRentalMobile/issues
- **Documentation**: See planning.md and database/README.md

---

**Last Updated**: February 2024
**Version**: 1.0.0
**Tested with**: React Native 0.84.0, Node.js 18+, iOS 15+, Android 11+
