import { Schema, model, Document } from 'mongoose';

export interface IQrToken extends Document {
  token: string;
  request: Schema.Types.ObjectId;
  expiresAt: Date;
  used: boolean;
}

const QrTokenSchema = new Schema<IQrToken>({
  token: { type: String, required: true, unique: true },
  request: { type: Schema.Types.ObjectId, ref: 'Request', required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
});

// TTL index to auto-delete expired tokens
QrTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<IQrToken>('QrToken', QrTokenSchema);