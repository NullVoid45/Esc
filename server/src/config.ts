import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 8081,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/hitam_outpass',
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  QR_TOKEN_SECRET: process.env.QR_TOKEN_SECRET || 'default_qr_secret_change_in_production',
  QR_TOKEN_TTL_SECONDS: parseInt(process.env.QR_TOKEN_TTL_SECONDS || '3600'),
  EXPO_PUSH_KEY: process.env.EXPO_PUSH_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Validate required config
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'QR_TOKEN_SECRET'];
const missing = requiredEnvVars.filter(key => !config[key as keyof typeof config]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}