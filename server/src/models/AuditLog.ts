import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: Schema.Types.ObjectId;
  action: string;
  targetId?: Schema.Types.ObjectId;
  targetType?: string;
  meta?: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetId: { type: Schema.Types.ObjectId },
  targetType: { type: String },
  meta: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

// Create indexes
AuditLogSchema.index({ actorId: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ action: 1 });

export default model<IAuditLog>('AuditLog', AuditLogSchema);