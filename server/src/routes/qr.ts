import { Router } from 'express';
import QRCode from 'qrcode';
import { verifyQrToken } from '../services/qr.service';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Verify QR token (public endpoint for security scanning)
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ valid: false, reason: 'missing_token' });
    }

    const result = await verifyQrToken(token);
    res.json(result);
  } catch (error) {
    res.status(500).json({ valid: false, reason: 'server_error' });
  }
});

// Generate QR image (optional helper for web admin)
router.get('/:token/img', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { token } = req.params;

    // Generate QR code as PNG
    const qrCodeDataURL = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300
    });

    // Convert data URL to buffer
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

export default router;