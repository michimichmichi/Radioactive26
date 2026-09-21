import express from 'express';
import {
    getEncorians,
    getEncorianById,
    approveEncorian,
    rejectEncorian,
    resendEmail,
    lookupTicket,
    checkInTicket
} from '../controllers/encorianController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requireRole('admin'));

router.get('/', getEncorians);
router.get('/ticket/:ticketCode', lookupTicket);
router.patch('/check-in', checkInTicket);
router.get('/:id', getEncorianById);
router.patch('/:id/approve', approveEncorian);
router.patch('/:id/reject', rejectEncorian);
router.patch('/:id/resend-email', resendEmail);

export default router;
