import express from 'express';
import { createEncorian } from '../controllers/encorianController.js';
import { verifyReferralCode } from '../controllers/referralCodeController.js';
import uploadTransfer, { validateTransferUpload } from '../middleware/uploadTransfer.js';

const router = express.Router();

router.get('/verify-code/:code', verifyReferralCode);
router.post('/', uploadTransfer.single('buktiTransfer'), validateTransferUpload, createEncorian);

export default router;

