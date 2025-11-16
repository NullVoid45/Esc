# Opencode Setup Instructions

## Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Environment Setup
```bash
# Copy environment template
cp server/.env.example server/.env

# Edit server/.env with your configuration
# Required variables:
# MONGO_URI=mongodb://localhost:27017/hitam_outpass
# JWT_SECRET=your_long_random_secret_here
# QR_TOKEN_SECRET=another_random_secret_here
```

### 2. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install mobile dependencies (from root)
cd ..
npm install
```

### 3. Database Setup
```bash
# Ensure MongoDB is running locally or update MONGO_URI for cloud DB

# Run database index setup
cd server
npm run ensure-indexes
```

### 4. Start Development Servers
```bash
# Terminal 1: Start backend API server
cd server
npm run dev
# Server will run on http://localhost:4000

# Terminal 2: Start mobile app
npm start
# Follow Expo instructions to run on device/emulator
```

### 5. Socket.IO Room Joining
The app uses Socket.IO for real-time updates. Clients automatically join rooms based on their role:

- **Students**: No specific room (receive personal updates)
- **Mentors**: Join `mentor:{branch}:{section}` rooms
- **HODs**: Join `hod:{branch}` rooms
- **Watchmen**: Join `scanner` room
- **Devs**: Join `dev` room

### 6. API Endpoints
- **Base URL**: `http://localhost:4000/api`
- **Auth**: `/auth/login`, `/auth/register`, `/auth/me`
- **Requests**: `/requests` (CRUD operations)
- **QR**: `/qr/verify` (token validation)
- **Admin**: `/admin/logs`, `/admin/users`

### 7. Testing
```bash
cd server
npm test          # Run API tests
npm run lint      # Check code quality
```

### 8. Sample Data
The mobile app includes fallback sample data that displays when the API is unavailable. This allows the UI to work even without a running backend during development.

## Deployment

### Backend Deployment
```bash
cd server
npm run build
npm start
```

### Mobile App
```bash
# Build for production
npm run android  # Android APK
npm run ios      # iOS build
npm run web      # Web build
```

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure MongoDB is running and MONGO_URI is correct
2. **Port Conflicts**: Default port is 4000, change in server/.env if needed
3. **CORS Issues**: Backend allows all origins in development
4. **Socket.IO**: Real-time features require backend to be running

### Environment Variables
All required environment variables are documented in `server/.env.example`. Generate strong secrets for JWT_SECRET and QR_TOKEN_SECRET in production.

## Architecture Overview

- **Backend**: Node.js + Express + MongoDB + Socket.IO
- **Frontend**: React Native (Expo) + TypeScript
- **Real-time**: Socket.IO for live updates
- **Security**: JWT authentication + role-based access control
- **QR System**: Secure token generation with TTL expiration