import { Router } from 'express';
import Request from '../models/Request';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import { generateQrToken } from '../services/qr.service';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Create request (student)
router.post('/', authenticate, authorize('student'), async (req: AuthRequest, res) => {
  try {
    const { reason, from, to, branch, section } = req.body;

    // Define approval chain (configurable)
    const approvalChain = [
      { role: 'mentor', status: 'pending' },
      { role: 'hod', status: 'pending' }
    ];

    const request = new Request({
      student: req.user._id,
      reason,
      from: new Date(from),
      to: new Date(to),
      branch: branch || req.user.branch,
      section: section || req.user.section,
      approvalChain
    });

    await request.save();

    // Emit to mentor room
    const socketService = global.socketService as any;
    if (socketService && branch && section) {
      socketService.emitToRoom(`mentor:${branch}:${section}`, 'request:new', {
        id: request._id,
        studentName: req.user.name,
        reason,
        from: request.from,
        to: request.to
      });
    }

    // Log action
    await AuditLog.create({
      actorId: req.user._id,
      action: 'create_request',
      targetId: request._id,
      targetType: 'Request'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get requests (filtered by role and branch/section)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { role, branch, section, status } = req.query;
    let query: any = {};

    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'mentor' && branch && section) {
      // Mentors see pending requests for their branch/section
      query = {
        branch,
        section,
        status: 'pending',
        'approvalChain.role': 'mentor',
        'approvalChain.status': 'pending'
      };
    } else if (req.user.role === 'hod' && branch) {
      // HODs see mentor-approved requests for their branch
      query = {
        branch,
        status: 'mentors_approved',
        'approvalChain.role': 'hod',
        'approvalChain.status': 'pending'
      };
    } else if (req.user.role === 'watchman') {
      // Watchmen see approved requests (for scanning)
      query.status = 'approved';
    } else if (req.user.role === 'dev') {
      // Devs see everything
    }

    // Apply additional filters if provided
    if (status) query.status = status;

    const requests = await Request.find(query)
      .populate('student', 'name roll email branch section')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single request
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('student', 'name roll email')
      .populate('approvalChain.approver', 'name');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check permissions
    if (req.user.role === 'student' && request.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve request (mentor/hod)
router.post('/:id/approve', authenticate, authorize('mentor', 'hod'), async (req: AuthRequest, res) => {
  try {
    const { role, comment } = req.body;
    const request = await Request.findById(req.params.id).populate('student', 'name branch section');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Find current step for this role
    const currentStepIndex = request.approvalChain.findIndex(
      step => step.role === role && step.status === 'pending'
    );

    if (currentStepIndex === -1) {
      return res.status(400).json({ error: 'No pending approval for your role' });
    }

    // Update step
    request.approvalChain[currentStepIndex].status = 'approved';
    request.approvalChain[currentStepIndex].approver = req.user._id;
    request.approvalChain[currentStepIndex].actedAt = new Date();
    request.approvalChain[currentStepIndex].comment = comment;

    const socketService = global.socketService as any;

    // Check approval logic
    if (role === 'mentor') {
      // Mentor approved - notify HOD
      request.status = 'mentors_approved';
      if (socketService && request.branch) {
        socketService.emitToRoom(`hod:${request.branch}`, 'request:mentors_approved', {
          id: request._id,
          studentName: request.student?.name,
          reason: request.reason
        });
      }
    } else if (role === 'hod') {
      // HOD approved - generate QR and notify scanner/dev
      request.status = 'approved';
      const qrToken = await generateQrToken(request._id.toString());
      request.qrTokenId = qrToken._id;

      if (socketService) {
        socketService.emitToRoom('scanner', 'request:approved', {
          requestId: request._id,
          qrToken: qrToken.token,
          studentName: request.student?.name,
          from: request.from,
          to: request.to
        });
        socketService.emitToRoom('dev', 'request:approved', {
          requestId: request._id,
          qrToken: qrToken.token,
          studentName: request.student?.name
        });
      }
    }

    await request.save();

    // Log action
    await AuditLog.create({
      actorId: req.user._id,
      action: 'approve_request',
      targetId: request._id,
      targetType: 'Request',
      meta: { step: currentStepIndex, role, comment }
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject request (approver)
router.post('/:id/reject', authenticate, authorize('approver', 'security'), async (req: AuthRequest, res) => {
  try {
    const { comment } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Find current step for this role
    const currentStepIndex = request.approvalChain.findIndex(
      step => step.role === req.user.role && step.status === 'pending'
    );

    if (currentStepIndex === -1) {
      return res.status(400).json({ error: 'No pending approval for your role' });
    }

    // Update step and request status
    request.approvalChain[currentStepIndex].status = 'rejected';
    request.approvalChain[currentStepIndex].approver = req.user._id;
    request.approvalChain[currentStepIndex].actedAt = new Date();
    request.approvalChain[currentStepIndex].comment = comment;
    request.status = 'rejected';

    await request.save();

    // Log action
    await AuditLog.create({
      actorId: req.user._id,
      action: 'reject_request',
      targetId: request._id,
      targetType: 'Request',
      meta: { step: currentStepIndex, comment }
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel request (student)
router.post('/:id/cancel', authenticate, authorize('student'), async (req: AuthRequest, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel non-pending request' });
    }

    request.status = 'cancelled';
    await request.save();

    // Log action
    await AuditLog.create({
      actorId: req.user._id,
      action: 'cancel_request',
      targetId: request._id,
      targetType: 'Request'
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;