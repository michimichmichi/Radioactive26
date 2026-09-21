import express from 'express';
import { createEncorian } from '../controllers/encorianController.js';
import uploadTransfer, { validateTransferUpload } from '../middleware/uploadTransfer.js';

const router = express.Router();

router.post('/', uploadTransfer.single('buktiTransfer'), validateTransferUpload, createEncorian);

export default router;
