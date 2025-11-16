# Hitam Outpass System

A comprehensive outpass management system for educational institutions with mobile app, web admin interface, and secure QR code verification.

## Architecture

- **Mobile App**: React Native (Expo) - Student interface for requesting outpasses and QR scanning
- **Web Admin**: React - Administrative interface for managing requests and approvals
- **Backend API**: Node.js + Express + MongoDB - RESTful API with real-time updates

## Prerequisites

- Node.js 18+
- MongoDB
- npm or yarn

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required: MONGO_URI, JWT_SECRET, QR_TOKEN_SECRET
```

### 2. Backend Setup

```bash
cd server
npm install
npm run dev
```

### 3. Mobile App Setup

```bash
# In root directory
npm install
npx expo start
```

### 4. Web Admin Setup (Optional)

```bash
cd web
npm install
npm start
```

## Development Commands

### Backend
```bash
cd server
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run ensure-indexes  # Setup database indexes
```

### Mobile
```bash
npm start            # Start Expo dev server
npm run android      # Build for Android
npm run ios          # Build for iOS
npm run web          # Build for web
```

### Web Admin
```bash
cd web
npm start            # Start development server
npm run build        # Build for production
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Requests
- `POST /api/requests` - Create outpass request
- `GET /api/requests` - List requests (filtered by role)
- `POST /api/requests/:id/approve` - Approve request
- `POST /api/requests/:id/reject` - Reject request
- `POST /api/requests/:id/cancel` - Cancel request

### QR Verification
- `POST /api/qr/verify` - Verify QR token
- `GET /api/qr/:token/img` - Generate QR image

### Admin
- `GET /api/admin/logs` - Audit logs
- `POST /api/admin/users` - Manage users

## Database Models

- **User**: Authentication and role management
- **Request**: Outpass requests with approval chain
- **QrToken**: Secure tokens for QR verification
- **AuditLog**: Activity logging

## Security Features

- JWT authentication with role-based access control
- Secure QR tokens with TTL expiration
- Password hashing with bcrypt
- Audit logging for all actions
- Input validation and sanitization

## Testing

```bash
cd server
npm test
```

## Deployment

### Backend
```bash
cd server
npm run build
npm start
```

### Mobile
```bash
npx expo build:android
npx expo build:ios
```

### Web
```bash
cd web
npm run build
# Serve build directory with any static server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

ISC
