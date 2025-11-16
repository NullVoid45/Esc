import { Router } from 'express';
import AuditLog from '../models/AuditLog';
import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get audit logs (admin only)
router.get('/logs', authenticate, authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const logs = await AuditLog.find()
      .populate('actorId', 'name email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await AuditLog.countDocuments();

    res.json({
      logs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create/update user (admin only)
router.post('/users', authenticate, authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const { name, email, password, role, roll } = req.body;

    let user;
    if (req.body.id) {
      // Update existing user
      user = await User.findById(req.body.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.name = name;
      user.email = email;
      user.role = role;
      if (roll) user.roll = roll;
      if (password) {
        // Hash new password if provided
        const bcrypt = require('bcrypt');
        user.passwordHash = await bcrypt.hash(password, 10);
      }

      await user.save();
    } else {
      // Create new user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash(password, 10);
      user = new User({ name, email, passwordHash, role, roll });
      await user.save();
    }

    // Log action
    await AuditLog.create({
      actorId: req.user._id,
      action: req.body.id ? 'update_user' : 'create_user',
      targetId: user._id,
      targetType: 'User',
      meta: { role, email }
    });

    res.json({ user: { id: user._id, name, email, role, roll } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', authenticate, authorize('admin'), async (req: AuthRequest, res) => {
  try {
    const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;