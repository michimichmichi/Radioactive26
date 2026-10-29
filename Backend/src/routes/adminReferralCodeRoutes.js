import express from 'express';
import {
    getReferralCodes,
    createReferralCode,
    updateReferralCode,
    deleteReferralCode
} from '../controllers/referralCodeController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requireRole('admin', 'finance'));

router.get('/', getReferralCodes);
router.post('/', createReferralCode);
router.patch('/:id', updateReferralCode);
router.delete('/:id', deleteReferralCode);

export default router;
