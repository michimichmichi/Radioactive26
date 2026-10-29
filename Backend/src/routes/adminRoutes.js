import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { getRacAttendance, updateRacAttendance, streamRacAttendance } from '../controllers/racAttendanceController.js';

const router = express.Router();
router.get('/stats', verifyToken, requireRole('admin', 'finance', 'event'), getAdminStats);
router.get('/rac-attendance', verifyToken, requireRole('admin', 'event'), getRacAttendance);
router.get('/rac-attendance/stream', verifyToken, requireRole('admin', 'event'), streamRacAttendance);
router.patch('/rac-attendance/:teamId/members/:memberId', verifyToken, requireRole('admin', 'event'), updateRacAttendance);

export default router;
