import crypto from 'crypto';
import QrToken from '../models/QrToken';
import { config } from '../config';

export async function generateQrToken(requestId: string, ttlSeconds: number = config.QR_TOKEN_TTL_SECONDS) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const doc = await QrToken.create({ token, request: requestId, expiresAt });
  return doc;
}

export async function verifyQrToken(token: string) {
  const doc = await QrToken.findOne({ token }).populate('request');
  if (!doc) {
    return { valid: false, reason: 'not_found' };
  }
  if (doc.expiresAt < new Date()) {
    return { valid: false, reason: 'expired' };
  }
  if (doc.request.status !== 'approved') {
    return { valid: false, reason: 'not_approved' };
  }
  // Optionally mark as used
  // doc.used = true; await doc.save();
  return {
    valid: true,
    request: {
      id: doc.request._id,
      student: doc.request.student,
      from: doc.request.from,
      to: doc.request.to
    }
  };
}