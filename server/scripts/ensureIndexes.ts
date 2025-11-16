import mongoose from 'mongoose';
import { config } from '../src/config';
import User from '../src/models/User';
import Request from '../src/models/Request';
import QrToken from '../src/models/QrToken';
import AuditLog from '../src/models/AuditLog';

async function ensureIndexes() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to MongoDB');

    // Ensure indexes
    console.log('Ensuring indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ User email index created');

    // Request indexes
    await Request.collection.createIndex({ student: 1 });
    await Request.collection.createIndex({ status: 1 });
    await Request.collection.createIndex({ createdAt: -1 });
    console.log('✓ Request indexes created');

    // QrToken TTL index (auto-delete expired tokens)
    await QrToken.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log('✓ QrToken TTL index created');

    // AuditLog indexes
    await AuditLog.collection.createIndex({ actorId: 1 });
    await AuditLog.collection.createIndex({ timestamp: -1 });
    await AuditLog.collection.createIndex({ action: 1 });
    console.log('✓ AuditLog indexes created');

    console.log('All indexes ensured successfully!');
  } catch (error) {
    console.error('Error ensuring indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  ensureIndexes();
}

export default ensureIndexes;