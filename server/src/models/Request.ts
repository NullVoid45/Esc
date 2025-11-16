import { Schema, model, Document } from 'mongoose';

export interface IApprovalStep {
  role: string;
  approver?: Schema.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  actedAt?: Date;
}

export interface IRequest extends Document {
  student: Schema.Types.ObjectId;
  reason: string;
  from: Date;
  to: Date;
  status: 'pending' | 'mentors_approved' | 'approved' | 'rejected' | 'cancelled';
  branch?: string;
  section?: string;
  approvalChain: IApprovalStep[];
  qrTokenId?: Schema.Types.ObjectId;
  createdAt: Date;
}

const RequestSchema = new Schema<IRequest>({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'mentors_approved', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  branch: { type: String },
  section: { type: String },
  approvalChain: [{
    role: { type: String, required: true },
    approver: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    actedAt: Date
  }],
  qrTokenId: { type: Schema.Types.ObjectId, ref: 'QrToken' },
  createdAt: { type: Date, default: Date.now }
});

// Create indexes
RequestSchema.index({ student: 1 });
RequestSchema.index({ status: 1 });
RequestSchema.index({ createdAt: -1 });

export default model<IRequest>('Request', RequestSchema);