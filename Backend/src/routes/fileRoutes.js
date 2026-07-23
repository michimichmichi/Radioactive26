import express from 'express';
import { serveUpload } from '../controllers/fileController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:folder/:filename', verifyToken, serveUpload);

export default router;
