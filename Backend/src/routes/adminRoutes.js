import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.get('/stats', verifyToken, requireRole('admin'), getAdminStats);

export default router;
