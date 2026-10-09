import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { getRacAttendance, updateRacAttendance, streamRacAttendance } from '../controllers/racAttendanceController.js';

const router = express.Router();
router.get('/stats', verifyToken, requireRole('admin'), getAdminStats);
router.get('/rac-attendance', verifyToken, requireRole('admin'), getRacAttendance);
router.get('/rac-attendance/stream', verifyToken, requireRole('admin'), streamRacAttendance);
router.patch('/rac-attendance/:teamId/members/:memberId', verifyToken, requireRole('admin'), updateRacAttendance);

export default router;
