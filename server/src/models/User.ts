import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'mentor' | 'hod' | 'watchman' | 'dev';
  branch?: string;
  section?: string;
  roll?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'mentor', 'hod', 'watchman', 'dev'], default: 'student' },
  branch: { type: String },
  section: { type: String },
  roll: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Create indexes
UserSchema.index({ email: 1 }, { unique: true });

export default model<IUser>('User', UserSchema);